export interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  modelUrl?: string; // URL to 3D model file (GLTF, GLB, etc.)
  previewImage?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
