import { toolDefinitions } from '../../tools/definitions.js';

export const listToolDefinitions = () => toolDefinitions;

export const registrySize = async (): Promise<number> => toolDefinitions.length;
