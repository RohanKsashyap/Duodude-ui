import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Plus, Eye, EyeOff, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import api from '../config/axios';

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  overlayOpacity?: number;
  order: number;
  isActive: boolean;
}

interface SlideFormData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  backgroundColor: string;
  textColor: string;
  overlayOpacity: number;
  order: number;
}

const AdminHeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    secondaryButtonText: 'Learn More',
    secondaryButtonLink: '/about',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    overlayOpacity: 0.4,
    order: 0
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hero-slides/admin/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSlides(response.data);
    } catch (error) {
      console.error('Failed to fetch slides:', error);
      toast.error('Failed to fetch slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingSlide) {
        await api.put(`/api/hero-slides/admin/${editingSlide._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Slide updated successfully');
      } else {
        await api.post('/api/hero-slides/admin', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Slide created successfully');
      }
      setShowForm(false);
      setEditingSlide(null);
      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Failed to save slide:', error);
      toast.error('Failed to save slide');
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description || '',
      image: slide.image,
      buttonText: slide.buttonText || 'Shop Now',
      buttonLink: slide.buttonLink || '/products',
      secondaryButtonText: slide.secondaryButtonText || 'Learn More',
      secondaryButtonLink: slide.secondaryButtonLink || '/about',
      backgroundColor: slide.backgroundColor || '#000000',
      textColor: slide.textColor || '#ffffff',
      overlayOpacity: slide.overlayOpacity ?? 0.4,
      order: slide.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/hero-slides/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Slide deleted successfully');
        fetchSlides();
      } catch (error) {
        console.error('Failed to delete slide:', error);
        toast.error('Failed to delete slide');
      }
    }
  };

  const toggleSlideStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/api/hero-slides/admin/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Slide status updated');
      fetchSlides();
    } catch (error) {
      console.error('Failed to toggle slide status:', error);
      toast.error('Failed to update slide status');
    }
  };

  const updateSlideOrder = async (id: string, newOrder: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/hero-slides/admin/${id}`, { order: newOrder }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSlides();
    } catch (error) {
      console.error('Failed to update slide order:', error);
      toast.error('Failed to update slide order');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      secondaryButtonText: 'Learn More',
      secondaryButtonLink: '/about',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      overlayOpacity: 0.4,
      order: slides.length
    });
  };

  const openForm = () => {
    resetForm();
    setEditingSlide(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSlide(null);
    resetForm();
  };

  return (
    <div className='container mx-auto p-4 text-white'>
      <h1 className='text-3xl font-bold mb-6'>Manage Hero Slides</h1>

      {!showForm ? (
        <button onClick={openForm} className='mb-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center'>
          <Plus size={18} className='mr-2' />
          Add New Slide
        </button>
      ) : (
        <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'>
          <div className='bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold'>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h2>
              <button onClick={closeForm} className='text-gray-400 hover:text-white'>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='col-span-1 md:col-span-2'>
                <label htmlFor='title' className='block text-sm font-medium mb-1'>Title</label>
                <input type='text' name='title' value={formData.title} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' required />
              </div>
              <div className='col-span-1 md:col-span-2'>
                <label htmlFor='subtitle' className='block text-sm font-medium mb-1'>Subtitle</label>
                <input type='text' name='subtitle' value={formData.subtitle} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' required />
              </div>
              <div className='col-span-1 md:col-span-2'>
                <label htmlFor='description' className='block text-sm font-medium mb-1'>Description</label>
                <textarea name='description' value={formData.description} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' rows={3}></textarea>
              </div>
              <div className='col-span-1 md:col-span-2'>
                <label htmlFor='image' className='block text-sm font-medium mb-1'>Image URL</label>
                <input type='text' name='image' value={formData.image} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' required />
              </div>
              <div className='col-span-1'>
                <label htmlFor='buttonText' className='block text-sm font-medium mb-1'>Button Text</label>
                <input type='text' name='buttonText' value={formData.buttonText} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='buttonLink' className='block text-sm font-medium mb-1'>Button Link</label>
                <input type='text' name='buttonLink' value={formData.buttonLink} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='secondaryButtonText' className='block text-sm font-medium mb-1'>Secondary Button Text</label>
                <input type='text' name='secondaryButtonText' value={formData.secondaryButtonText} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='secondaryButtonLink' className='block text-sm font-medium mb-1'>Secondary Button Link</label>
                <input type='text' name='secondaryButtonLink' value={formData.secondaryButtonLink} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='backgroundColor' className='block text-sm font-medium mb-1'>Background Color</label>
                <input type='color' name='backgroundColor' value={formData.backgroundColor} onChange={handleInputChange} className='w-full h-10 bg-gray-700 border border-gray-600 rounded-md' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='textColor' className='block text-sm font-medium mb-1'>Text Color</label>
                <input type='color' name='textColor' value={formData.textColor} onChange={handleInputChange} className='w-full h-10 bg-gray-700 border border-gray-600 rounded-md' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='overlayOpacity' className='block text-sm font-medium mb-1'>Overlay Opacity (0-1)</label>
                <input type='number' name='overlayOpacity' value={formData.overlayOpacity} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' min='0' max='1' step='0.1' />
              </div>
              <div className='col-span-1'>
                <label htmlFor='order' className='block text-sm font-medium mb-1'>Order</label>
                <input type='number' name='order' value={formData.order} onChange={handleInputChange} className='w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              <div className='col-span-1 md:col-span-2 flex justify-end space-x-4'>
                <button type='button' onClick={closeForm} className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center'>
                  <X size={18} className='mr-2' />
                  Cancel
                </button>
                <button type='submit' className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center'>
                  <Save size={18} className='mr-2' />
                  {editingSlide ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className='text-center py-10'>Loading slides...</div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {slides.map((slide, index) => (
            <div key={slide._id} className='bg-gray-800 rounded-lg shadow-lg overflow-hidden relative'>
              <img src={slide.image} alt={slide.title} className='w-full h-48 object-cover' />
              <div className='absolute top-2 right-2 flex space-x-2'>
                <button onClick={() => toggleSlideStatus(slide._id)} className={`p-2 rounded-full text-white ${slide.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => updateSlideOrder(slide._id, slide.order - 1)} disabled={slide.order === 0} className='p-2 rounded-full bg-gray-700 text-white disabled:opacity-50'>
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => updateSlideOrder(slide._id, slide.order + 1)} disabled={index === slides.length - 1} className='p-2 rounded-full bg-gray-700 text-white disabled:opacity-50'>
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className='p-4'>
                <h3 className='text-xl font-bold'>{slide.title}</h3>
                <p className='text-gray-400 mt-1'>{slide.subtitle}</p>
                <div className='mt-4 flex justify-end space-x-3'>
                  <button onClick={() => handleEdit(slide)} className='p-2 text-blue-400 hover:text-blue-300'>
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDelete(slide._id)} className='p-2 text-red-500 hover:text-red-400'>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlider;

