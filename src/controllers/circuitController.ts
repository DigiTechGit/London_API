import { FastifyReply, FastifyRequest } from "fastify";
import { endpoints } from "../utils/API";

const apiKey = 'AtLbZqdywTLWAz5zyATR';
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);

export const getCircuitPlans = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const response = await fetch(`${endpoints.getCircuitPlans}`, {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      reply.code(200).send(await response.json());
    } else {
      reply.code(400).send({ error: "Failed to get Circuit plans" });
    }
  } catch (error: any) {
    reply.code(500).send({ error: error.message });
  }
};

export const postCircuitPlans = async (request: FastifyRequest, reply: FastifyReply) => {
  const model = request.body;

  try {
    const response = await fetch(`${endpoints.getCircuitPlans}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(model),
    });

    if (response.ok) {
      reply.code(200).send(await response.json());
    } else {
      reply.code(400).send({ error: "Failed to create a new plan" });
    }
  } catch (error: any) {
    reply.code(500).send({ error: error.message });
  }
};

export const postCircuitStops = async (request: FastifyRequest, reply: FastifyReply) => {
  const { planId } = request.params as { planId: string };
  const model = request.body;

  try {
    const response = await fetch(`${endpoints.getCircuitStops}/${planId}/stops:import`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(model),
    });

    if (response.ok) {
      reply.code(200).send(await response.json());
    } else {
      reply.code(400).send({ error: "Failed to batch import stops" });
    }
  } catch (error: any) {
    reply.code(500).send({ error: error.message });
  }
};

export const optimizeCircuitPlan = async (request: FastifyRequest, reply: FastifyReply) => {
  const { planId } = request.params as { planId: string };

  try {
    const response = await fetch(`${endpoints.getCircuitPlans}/${planId}/optimize`, {
      method: "POST",
      headers: headers,
    });

    if (response.ok) {
      reply.code(200).send(await response.json());
    } else {
      reply.code(400).send({ error: "Failed to optimize plan" });
    }
  } catch (error: any) {
    reply.code(500).send({ error: error.message });
  }
};

export const getDrivers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const response = await fetch(`${endpoints.getCircuitDrivers}`, {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      reply.code(200).send(await response.json());
    } else {
      reply.code(400).send({ error: "Failed to get drivers" });
    }
  } catch (error: any) {
    reply.code(500).send({ error: error.message });
  }
};

export const getDepots = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const response = await fetch(`${endpoints.getCircuitDepots}`, {
      method: "GET",
      headers: headers,
    });

    if (response.ok) {
      reply.code(200).send(await response.json());
    } else {
      reply.code(400).send({ error: "Failed to get depots" });
    }
  } catch (error: any) {
    reply.code(500).send({ error: error.message });
  }
};
