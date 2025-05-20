import supabase from '@services/supabase';

const productService = {
  async getProductsByPage(page = 1, limit = 12, categoryId = null) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
    return { 
      products: data, 
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  },
  
  async getProductById(id) {
    if (!id) {
      throw new Error('ID do produto não fornecido');
    }

    console.log('Buscando produto:', id);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('id', id)
      .single();
    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
    return data;
  },
  
  async createProduct(product) {
    if (!product?.title || !product?.price) {
      throw new Error('Dados do produto incompletos');
    }

    console.log('Criando produto:', product);
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select(`
        *,
        category:categories(name)
      `);
    if (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
    return data[0];
  },
  
  async updateProduct(id, product) {
    if (!id) {
      throw new Error('ID do produto não fornecido');
    }
    if (!product?.title || !product?.price) {
      throw new Error('Dados do produto incompletos');
    }

    console.log('Atualizando produto:', { id, product });
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select(`
        *,
        category:categories(name)
      `);
    if (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
    return data[0];
  },

  async deleteProduct(id) {
    if (!id) {
      throw new Error('ID do produto não fornecido');
    }

    console.log('Excluindo produto:', id);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);    
    if (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
    return true;
  }
};

export default productService;