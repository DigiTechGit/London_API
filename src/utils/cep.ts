export const buscarCep = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data = await response.json();

      // Verifica se o CEP retornou um resultado válido
      if (data.erro) {
        throw new Error("CEP não encontrado");
      }

      return data.logradouro; // Retorna os dados do CEP
    } catch (error) {
      console.error(error);
      return ""; // Retorna null em caso de erro
    }
  };