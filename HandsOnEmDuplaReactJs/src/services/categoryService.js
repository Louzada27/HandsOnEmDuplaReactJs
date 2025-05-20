import supabase from '@services/supabase';

const categoryService = {
    async getCategories() {
        console.log('Buscando categorias...');
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
            
        if (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
        console.log('Categorias encontradas:', data);
        return data;
    },

    async getCategoryById(id) {
        if (!id) {
            throw new Error('ID da categoria não fornecido');
        }

        console.log('Buscando categoria:', id);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) {
            console.error('Erro ao buscar categoria:', error);
            throw error;
        }
        return data;
    },

    async createCategory(categoryData) {
        if (!categoryData?.name) {
            throw new Error('Nome da categoria é obrigatório');
        }

        console.log('Criando categoria:', categoryData);
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name: categoryData.name }])
            .select()
            .single();
            
        if (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }
        return data;
    },

    async updateCategory(id, categoryData) {
        if (!id) {
            throw new Error('ID da categoria não fornecido');
        }
        if (!categoryData?.name) {
            throw new Error('Nome da categoria é obrigatório');
        }

        console.log('Atualizando categoria:', { id, data: categoryData });
        const { data, error } = await supabase
            .from('categories')
            .update({ name: categoryData.name })
            .eq('id', id)
            .select()
            .single();
            
        if (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }
        return data;
    },

    async deleteCategory(id) {
        if (!id) {
            throw new Error('ID da categoria não fornecido');
        }

        console.log('Excluindo categoria:', id);
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Erro ao excluir categoria:', error);
            throw error;
        }
        return true;
    }
};

export default categoryService; 