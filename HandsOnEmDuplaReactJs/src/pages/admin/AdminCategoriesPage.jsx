import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import categoryService from '@services/categoryService';
import CategoryForm from '@components/CategoryForm';

const AdminCategoriesPage = () => {
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Listar categorias
    const {
        data: categories,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories
    });

    // Mutação para excluir categoria
    const deleteMutation = useMutation({
        mutationFn: categoryService.deleteCategory,
        onSuccess: () => {
            toast.success('Categoria excluída com sucesso!', { icon: '🗑️' });
            queryClient.invalidateQueries(['categories']);
        },
        onError: err => toast.error(`Erro: ${err.message}`, { icon: '❌' })
    });

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedCategory(null);
    };

    if (isError) {
        return (
            <div className="alert alert-danger mt-4">
                Erro ao carregar categorias: {error.message}
            </div>
        );
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12">
                <div className="card">
                    <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
                        <h2 className="mb-0">Categorias</h2>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setSelectedCategory(null);
                                setShowForm(true);
                            }}>
                            Nova Categoria
                        </button>
                    </div>

                    <div className="card-body">
                        {isLoading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th className="text-end">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories?.map(category => (
                                            <tr key={category.id}>
                                                <td>{category.name}</td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleEdit(category)}>
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(category.id)}>
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal do Formulário */}
            {showForm && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleFormSuccess}
                                    aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <CategoryForm
                                    category={selectedCategory}
                                    onSuccess={handleFormSuccess}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoriesPage; 