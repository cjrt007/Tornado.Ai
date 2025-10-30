import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import {
  ControlSurfaceSchema,
  FeatureTogglePatchSchema,
  FeatureToggleSchema,
  RoleControlPatchSchema,
  RoleControlSchema,
  ScanProfilePatchSchema,
  ScanProfileSchema
} from '../../shared/types.js';
import { controlCenter } from '../../core/control/center.js';

type ControlRequest<T> = FastifyRequest<{ Body: T }>;

type SnapshotResponse = FastifyReply;

const FeatureTogglePayloadSchema = z.object({
  features: z.array(z.union([FeatureToggleSchema, FeatureTogglePatchSchema]))
});

const RolePayloadSchema = z.object({
  roles: z.array(z.union([RoleControlSchema, RoleControlPatchSchema]))
});

const ScanPayloadSchema = z.object({
  scanProfiles: z.array(z.union([ScanProfileSchema, ScanProfilePatchSchema]))
});

export const getControlSurface = async (_request: FastifyRequest, reply: SnapshotResponse) => {
  const snapshot = controlCenter.snapshot();
  return reply.code(200).send(ControlSurfaceSchema.parse(snapshot));
};

export const updateFeatureSurface = async (
  request: ControlRequest<z.infer<typeof FeatureTogglePayloadSchema>>,
  reply: FastifyReply
) => {
  const payload = FeatureTogglePayloadSchema.parse(request.body);
  const updated = controlCenter.updateFeatures(payload.features);
  return reply.code(200).send(updated.features);
};

export const updateRoleSurface = async (
  request: ControlRequest<z.infer<typeof RolePayloadSchema>>,
  reply: FastifyReply
) => {
  const payload = RolePayloadSchema.parse(request.body);
  const updated = controlCenter.updateRoles(payload.roles);
  return reply.code(200).send(updated.roles);
};

export const updateScanSurface = async (
  request: ControlRequest<z.infer<typeof ScanPayloadSchema>>,
  reply: FastifyReply
) => {
  const payload = ScanPayloadSchema.parse(request.body);
  const updated = controlCenter.updateScanProfiles(payload.scanProfiles);
  return reply.code(200).send(updated.scanProfiles);
};
