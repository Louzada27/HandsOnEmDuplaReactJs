import { useQuery } from '@tanstack/react-query';
import categoryService from '@services/categoryService';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
    const { data: categories, isLoading, isError, error } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories
    });

    console.log('CategoryFilter - categories:', categories);
    console.log('CategoryFilter - isLoading:', isLoading);
    console.log('CategoryFilter - isError:', isError);
    console.log('CategoryFilter - error:', error);

    if (isLoading) {
        return <div className="spinner-border spinner-border-sm" role="status" />;
    }

    if (isError) {
        console.error('Erro ao carregar categorias:', error);
        return <div className="alert alert-danger">Erro ao carregar categorias</div>;
    }

    const handleChange = (e) => {
        const value = e.target.value;
        // Converte para número se não for vazio, senão mantém como null
        onCategoryChange(value ? parseInt(value) : null);
    };

    return (
        <div className="mb-4">
            <label htmlFor="categoryFilter" className="form-label">Filtrar por Categoria</label>
            <select
                className="form-select"
                id="categoryFilter"
                value={selectedCategory || ''}
                onChange={handleChange}>
                <option value="">Todas as categorias</option>
                {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CategoryFilter; 