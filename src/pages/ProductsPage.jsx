// src/pages/ProductsPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import productService from '@services/productService';
import CategoryFilter from '@components/CategoryFilter';
import Pagination from '@components/Pagination';
import { formatPrice } from '@assets/js/util.js';

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = ({ onAddToCart }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['products', currentPage, selectedCategory],
        queryFn: () => productService.getProductsByPage(currentPage, PRODUCTS_PER_PAGE, selectedCategory)
    });

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1); // Reset to first page when changing category
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
            <h1 className="mb-4">Produtos</h1>
            
            <div className="row">
                <div className="col-md-3">
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
                
                <div className="col-md-9">
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {data?.products.map(product => (
                            <div key={product.id} className="col">
                                <div className="card h-100">
                                    <img
                                        src={product.image_url}
                                        className="card-img-top"
                                        alt={product.title}
                                        style={{ height: 200, objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title">{product.title}</h5>
                                        <p className="card-text text-muted">
                                            {product.category?.name || 'Sem categoria'}
                                        </p>
                                        <p className="card-text">{product.description}</p>
                                        <p className="card-text fw-bold">
                                            R$ {formatPrice(product.price)}
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => onAddToCart(product)}>
                                            Adicionar ao Carrinho
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data?.totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={data.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
