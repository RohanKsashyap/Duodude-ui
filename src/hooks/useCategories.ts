import { useState, useEffect } from 'react';
import api from '../config/axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  parent: { _id: string; name: string; slug: string } | null;
}

export interface GroupedCategory {
  parent: Category;
  children: Category[];
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/categories')
      .then((res) => {
        // Only show active categories
        setCategories((res.data as Category[]).filter((c) => c.active));
      })
      .catch(() => {
        // Silently fail — nav/filters just won't show dynamic categories
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const topLevel = categories.filter((c) => !c.parent);

  const grouped: GroupedCategory[] = topLevel.map((parent) => ({
    parent,
    children: categories.filter((c) => c.parent?._id === parent._id),
  }));

  return { categories, grouped, topLevel, loading };
}
