import { PrismaClient } from '@prisma/client';

const apiKey = process.env.API_KEY;
import { endpoints } from "../utils/API";

const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

const prisma = new PrismaClient();

export class MotoristaService {
  static async getMotoristasComDetalhes() {
    try {
      const motoristas = await prisma.motorista.findMany();
      const driversWithDetails = [];
  
      for (const motorista of motoristas) {
        const driverId = motorista.idCircuit;
  
        const response = await fetch(`${endpoints.getCircuitBase}/${driverId}`, {
          method: 'GET',
          headers: headers,
        });
  
        if (response.ok) {
          const driverData = await response.json();
          if(driverData.active){
          driversWithDetails.push({
            id: motorista.id,
            idCircuit: motorista.idCircuit,
            placa: motorista.placa,
            name: driverData.name,
            email: driverData.email,
            active: driverData.active,
          });
          }else{
            prisma.motorista.delete({where: {id: motorista.id}})
          }
        } else {
          console.log(`Falha ao obter dados do driver ${driverId}`);
        }
      }
      return driversWithDetails;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Erro ao buscar motoristas com detalhes: ' + error.message);
      } else {
        throw new Error('Erro ao buscar motoristas com detalhes: ' + String(error));
      }
    }
  }
}
