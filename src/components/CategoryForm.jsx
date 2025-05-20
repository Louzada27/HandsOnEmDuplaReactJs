import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import categoryService from '@services/categoryService';

const CategoryForm = ({ category, onSuccess }) => {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        name: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (category) {
            setForm({
                name: category.name || ''
            });
        } else {
            // Garantir que o form sempre tenha um valor inicial
            setForm({
                name: ''
            });
        }
    }, [category]);

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = 'O nome é obrigatório';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createMutation = useMutation({
        mutationFn: categoryService.createCategory,
        onSuccess: () => {
            toast.success('Categoria criada com sucesso!', { icon: '✅' });
            queryClient.invalidateQueries(['categories']);
            if (onSuccess) onSuccess();
        },
        onError: err => toast.error(`Erro: ${err.message}`, { icon: '❌' })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => {
            if (!id) {
                throw new Error('ID da categoria não definido');
            }
            return categoryService.updateCategory(id, data);
        },
        onSuccess: () => {
            toast.success('Categoria atualizada com sucesso!', { icon: '✅' });
            queryClient.invalidateQueries(['categories']);
            if (onSuccess) onSuccess();
        },
        onError: err => toast.error(`Erro: ${err.message}`, { icon: '❌' })
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (category?.id) {
                await updateMutation.mutateAsync({ 
                    id: category.id, 
                    data: form 
                });
            } else {
                await createMutation.mutateAsync(form);
            }
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {category ? 'Editar Categoria' : 'Nova Categoria'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => onSuccess && onSuccess()}
                            aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={form.name || ''}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.name && (
                                    <div className="invalid-feedback">{errors.name}</div>
                                )}
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => onSuccess && onSuccess()}>
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"></span>
                                            Salvando...
                                        </>
                                    ) : category ? 'Atualizar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryForm; 