// src/pages/admin/AdminProductsPage.jsx
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '@services/productService';
import { formatPrice } from '@assets/js/util.js';
import Pagination from '@components/Pagination';

const PRODUCTS_PER_PAGE = 12;

const AdminProductsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Lista de produtos
    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['products', currentPage],
        queryFn: () => productService.getProductsByPage(currentPage, PRODUCTS_PER_PAGE)
    });

    // Mutação para deletar produto
    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            toast.success('Produto excluído com sucesso!', { icon: '🗑️' });
            queryClient.invalidateQueries(['products']);
        },
        onError: err => toast.error(`Erro: ${err.message}`, { icon: '❌' })
    });

    // Manipuladores
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            deleteMutation.mutate(id);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-danger" role="alert">
                Erro ao carregar produtos: {error.message}
            </div>
        );
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Produtos</h1>
                <Link to="/admin/products/new" className="btn btn-success">
                    <i className="bi bi-plus-lg me-2"></i>
                    Novo Produto
                </Link>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imagem</th>
                            <th>Título</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="img-thumbnail"
                                        style={{ maxHeight: 50 }}
                                    />
                                </td>
                                <td>{product.title}</td>
                                <td>{product.category?.name || 'Sem categoria'}</td>
                                <td>R$ {product.price.toFixed(2)}</td>
                                <td>
                                    <div className="btn-group">
                                        <Link
                                            to={`/admin/products/edit/${product.id}`}
                                            className="btn btn-sm btn-primary">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(product.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data?.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage - 1)}>
                                    Anterior
                                </button>
                            </li>
                            {[...Array(data.totalPages)].map((_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(index + 1)}>
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === data.totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}>
                                    Próxima
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default AdminProductsPage;