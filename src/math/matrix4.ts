export namespace Matrix4 {
  export function getTranslation(mat: Float32Array, out: Float32Array) {
    out[0] = mat[12]; out[1] = mat[13]; out[2] = mat[14]; return out
  }
  export function getScaling(mat: Float32Array, out: Float32Array) {
    let m11 = mat[0], m12 = mat[1], m13 = mat[2], m21 = mat[4], m22 = mat[5], m23 = mat[6], m31 = mat[8], m32 = mat[9], m33 = mat[10]; out[0] = Math.hypot(m11, m12, m13); out[1] = Math.hypot(m21, m22, m23); out[2] = Math.hypot(m31, m32, m33); return out;
  }
  export function getRotation(mat: Float32Array, out: Float32Array) {
    let scaling = getScaling(mat, new Float32Array(3)), is1 = 1 / scaling[0], is2 = 1 / scaling[1], is3 = 1 / scaling[2], sm11 = mat[0] * is1, sm12 = mat[1] * is2, sm13 = mat[2] * is3, sm21 = mat[4] * is1, sm22 = mat[5] * is2, sm23 = mat[6] * is3, sm31 = mat[8] * is1, sm32 = mat[9] * is2, sm33 = mat[10] * is3, trace = sm11 + sm22 + sm33, S = 0; if (trace > 0) { S = Math.sqrt(trace + 1.0) * 2; out[3] = 0.25 * S; out[0] = (sm23 - sm32) / S; out[1] = (sm31 - sm13) / S; out[2] = (sm12 - sm21) / S; } else if (sm11 > sm22 && sm11 > sm33) { S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2; out[3] = (sm23 - sm32) / S; out[0] = 0.25 * S; out[1] = (sm12 + sm21) / S; out[2] = (sm31 + sm13) / S; } else if (sm22 > sm33) { S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2; out[3] = (sm31 - sm13) / S; out[0] = (sm12 + sm21) / S; out[1] = 0.25 * S; out[2] = (sm23 + sm32) / S; } else { S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2; out[3] = (sm12 - sm21) / S; out[0] = (sm31 + sm13) / S; out[1] = (sm23 + sm32) / S; out[2] = 0.25 * S; } return out
  }
  export function copy(a: Float32Array, out: Float32Array) {
    out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3]; out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7]; out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11]; out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15]; return out
  }
  export function fromRotationTranslationScale(q: Float32Array, v: Float32Array, s: Float32Array, out: Float32Array) {
    let x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, sx = s[0], sy = s[1], sz = s[2]; out[0] = (1 - (yy + zz)) * sx; out[1] = (xy + wz) * sx; out[2] = (xz - wy) * sx; out[3] = 0; out[4] = (xy - wz) * sy; out[5] = (1 - (xx + zz)) * sy; out[6] = (yz + wx) * sy; out[7] = 0; out[8] = (xz + wy) * sz; out[9] = (yz - wx) * sz; out[10] = (1 - (xx + yy)) * sz; out[11] = 0; out[12] = v[0]; out[13] = v[1]; out[14] = v[2]; out[15] = 1; return out
  }
  export function multiply(a: Float32Array, b: Float32Array, out: Float32Array) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3]; out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33, b0 = b[4], b1 = b[5], b2 = b[6], b3 = b[7], out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33, b0 = b[8], b1 = b[9], b2 = b[10], b3 = b[11], out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33, b0 = b[12], b1 = b[13], b2 = b[14], b3 = b[15], out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30, out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31, out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32, out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33; return out
  }
  export function lookAt(eye: Float32Array, center: Float32Array, up: Float32Array, out: Float32Array) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len; let eyex = eye[0]; let eyey = eye[1]; let eyez = eye[2]; let upx = up[0]; let upy = up[1]; let upz = up[2]; let centerx = center[0]; let centery = center[1]; let centerz = center[2]; if (Math.abs(eyex - centerx) < 0.000001 && Math.abs(eyey - centery) < 0.000001 && Math.abs(eyez - centerz) < 0.000001) { return identity(out); } z0 = eyex - centerx; z1 = eyey - centery; z2 = eyez - centerz; len = 1 / Math.hypot(z0, z1, z2); z0 *= len; z1 *= len; z2 *= len; x0 = upy * z2 - upz * z1; x1 = upz * z0 - upx * z2; x2 = upx * z1 - upy * z0; len = Math.hypot(x0, x1, x2); if (!len) { x0 = 0; x1 = 0; x2 = 0; } else { len = 1 / len; x0 *= len; x1 *= len; x2 *= len; } y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0; len = Math.hypot(y0, y1, y2); if (!len) { y0 = 0; y1 = 0; y2 = 0; } else { len = 1 / len; y0 *= len; y1 *= len; y2 *= len; } out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0; out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0; out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0; out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez); out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez); out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez); out[15] = 1; return out
  }
  export function identity(out: Float32Array) {
    out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0; out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0; out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0; out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1; return out;
  }
  export function perspective(fovy: number, aspect: number, near: number, far: number, out: Float32Array) {
    let f = 1.0 / Math.tan(fovy / 2), nf; out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0; out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0; out[8] = 0; out[9] = 0; out[11] = -1; out[12] = 0; out[13] = 0; out[15] = 0; if (far != null && far !== Infinity) { nf = 1 / (near - far); out[10] = (far + near) * nf; out[14] = 2 * far * near * nf; } else { out[10] = -1; out[14] = -2 * near; } return out;
  }
  export function invert(a: Float32Array, out: Float32Array) {
    let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]; let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]; let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]; let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]; let b00 = a00 * a11 - a01 * a10; let b01 = a00 * a12 - a02 * a10; let b02 = a00 * a13 - a03 * a10; let b03 = a01 * a12 - a02 * a11; let b04 = a01 * a13 - a03 * a11; let b05 = a02 * a13 - a03 * a12; let b06 = a20 * a31 - a21 * a30; let b07 = a20 * a32 - a22 * a30; let b08 = a20 * a33 - a23 * a30; let b09 = a21 * a32 - a22 * a31; let b10 = a21 * a33 - a23 * a31; let b11 = a22 * a33 - a23 * a32; let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) { return null; } det = 1.0 / det; out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det; out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det; out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det; out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det; out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det; out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det; out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det; out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det; return out
  }
}