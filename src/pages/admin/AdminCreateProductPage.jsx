// src/pages/admin/AdminCreateProductPage.jsx
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '@services/productService';
import categoryService from '@services/categoryService';

const AdminCreateProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditing = !!id;

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        image_url: '',
        category_id: ''
    });
    const [errors, setErrors] = useState({});

    // Buscar categorias
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories
    });

    // Buscar produto se estiver editando
    const { data: product } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProductById(id),
        enabled: isEditing
    });

    // Se for um produto para editar, inicializa o estado com os dados do produto
    useEffect(() => {
        if (product) {
            setForm({
                title: product.title || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                image_url: product.image_url || '',
                category_id: product.category_id || ''
            });
        }
    }, [product]);

    const createProductMutation = useMutation({
        mutationFn: productService.createProduct,
        onSuccess: () => {
            toast.success('Produto criado com sucesso!', { icon: '✅' });
            navigate('/admin/products');
        },
        onError: (error) => {
            toast.error(`Erro ao criar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }) => {
            if (!id) {
                throw new Error('ID do produto não fornecido');
            }
            return productService.updateProduct(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']).then(() => {
                toast.success('Produto atualizado com sucesso!', { icon: '✅' });
                navigate('/admin/products');
            }).catch((error) => {
                toast.error(`Erro ao atualizar lista de produtos: ${error.message}`, { icon: '❌' });
            });
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'O título é obrigatório';
        if (!form.description.trim()) newErrors.description = 'A descrição é obrigatória';
        if (!form.price) newErrors.price = 'O preço é obrigatório';
        if (isNaN(form.price) || form.price <= 0) {
            newErrors.price = 'O preço deve ser um número positivo';
        }
        if (!form.category_id) newErrors.category_id = 'A categoria é obrigatória';
        if (!form.image_url.trim()) newErrors.image_url = 'A URL da imagem é obrigatória';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!validate()) return;

        const productData = {
            ...form,
            price: parseFloat(form.price)
        };

        try {
            if (isEditing && id) {
                updateProductMutation.mutate({ id, data: productData });
            } else {
                createProductMutation.mutate(productData);
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            toast.error(`Erro ao salvar produto: ${error.message}`, { icon: '❌' });
        }
    };

    return (
        <div className="container">
            <h1 className="mb-4">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h1>

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                        Título
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                    />
                    {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                        Descrição
                    </label>
                    <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        id="description"
                        name="description"
                        rows="3"
                        value={form.description}
                        onChange={handleChange}
                    />
                    {errors.description && (
                        <div className="invalid-feedback">{errors.description}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="price" className="form-label">
                        Preço
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        id="price"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                    />
                    {errors.price && (
                        <div className="invalid-feedback">{errors.price}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="category_id" className="form-label">
                        Categoria
                    </label>
                    <select
                        className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                        id="category_id"
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}>
                        <option value="">Selecione uma categoria</option>
                        {categories?.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && (
                        <div className="invalid-feedback">{errors.category_id}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="image_url" className="form-label">
                        URL da Imagem
                    </label>
                    <input
                        type="url"
                        className={`form-control ${errors.image_url ? 'is-invalid' : ''}`}
                        id="image_url"
                        name="image_url"
                        value={form.image_url}
                        onChange={handleChange}
                    />
                    {errors.image_url && (
                        <div className="invalid-feedback">{errors.image_url}</div>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                        {createProductMutation.isPending || updateProductMutation.isPending ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"></span>
                                Salvando...
                            </>
                        ) : (
                            'Salvar'
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/products')}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminCreateProductPage;