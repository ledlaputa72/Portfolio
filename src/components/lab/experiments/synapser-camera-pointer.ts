import * as THREE from "three";

const _target = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();
const _yawQuat = new THREE.Quaternion();
const _pitchQuat = new THREE.Quaternion();

/** Emphasize pointer deflection toward screen edges. */
export function synapserPointerEdge(value: number, power = 0.82): number {
  if (value === 0) return 0;
  return Math.sign(value) * Math.pow(Math.abs(value), power);
}

/**
 * Orbit camera around a look-at target from pointer position.
 * Inverted: mouse up → view shifts down; mouse right → view shifts left.
 */
export function applySynapserPointerOrbit(
  posX: number,
  posY: number,
  posZ: number,
  lookX: number,
  lookY: number,
  lookZ: number,
  pointerX: number,
  pointerY: number,
  yawStrength: number,
  pitchStrength: number,
  edgePower: number,
): { x: number; y: number; z: number } {
  _target.set(lookX, lookY, lookZ);
  _offset.set(posX - lookX, posY - lookY, posZ - lookZ);

  if (_offset.lengthSq() < 1e-8) return { x: posX, y: posY, z: posZ };

  const edgeX = synapserPointerEdge(pointerX, edgePower);
  const edgeY = synapserPointerEdge(pointerY, edgePower);

  _yawQuat.setFromAxisAngle(_yAxis, -edgeX * yawStrength);
  _offset.applyQuaternion(_yawQuat);

  _right.crossVectors(_offset, _yAxis);
  if (_right.lengthSq() > 1e-8) {
    _right.normalize();
    _pitchQuat.setFromAxisAngle(_right, edgeY * pitchStrength);
    _offset.applyQuaternion(_pitchQuat);
  }

  return {
    x: _target.x + _offset.x,
    y: _target.y + _offset.y,
    z: _target.z + _offset.z,
  };
}

