const API_BASE_URL = "https://ssw.inf.br/api";
const API_CIRCUIT_BASE_URL = "https://api.getcircuit.com/public/v0.2b";

export const endpoints = {
	generateToken: `${API_BASE_URL}/generateToken`,  // Endpoint para gerar o token de autenticação
	roteirizaRomaneioStockfy: `${API_BASE_URL}/roteirizaRomaneioStockfy`,  // Endpoint para roteirizar um romaneio
	trackingdanfe: `${API_BASE_URL}/trackingdanfe`,  // Endpoint para roteirizar um romaneio
	getCircuitBase: `${API_CIRCUIT_BASE_URL}`,
};