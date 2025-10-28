// TypeScript types untuk Fuzzy Assessment

export interface SaveAssessmentRequest {
  nameBuilding: string;
  finalStatus: 'Pemeliharaan' | 'Renovasi' | 'Pembongkaran';
  fuzzyScore: number;
  categories: CategoryAssessmentData[];
}

export interface CategoryAssessmentData {
  categoryId: number;
  categoryName: string;
  categoryValue: number;
  subcategories: SubcategoryAssessmentData[];
}

export interface SubcategoryAssessmentData {
  subcategoryId: number;
  subcategoryName: string;
  subcategoryValue: number;
  items: ItemAssessmentData[];
}

export interface ItemAssessmentData {
  itemName: string;
  damageValue: number;
  condition?: string;
  notes?: string;
}

// Response types
export interface BuildingAssessmentResponse {
  id: number;
  nameBuilding: string;
  finalStatus: string;
  fuzzyScore: number | null;
  createdAt: string;
  updatedAt: string;
  categories: CategoryResponse[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  categoryValue?: number | null;
  displayOrder: number;
  subcategories: SubcategoryResponse[];
}

export interface SubcategoryResponse {
  id: number;
  name: string;
  description?: string | null;
  subcategoryValue?: number | null;
  displayOrder: number;
  items: ItemResponse[];
}

export interface ItemResponse {
  id: number;
  name: string;
  damageValue: number;
  condition?: string | null;
  notes?: string | null;
  createdAt: string;
}
