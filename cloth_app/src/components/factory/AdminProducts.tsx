import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ClothingCategory } from '../../types';
import { Plus, Edit3, Trash2, X, Check, Package, Image as ImageIcon } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct } = useApp();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form
  const [formData, setFormData] = useState({
    name: '',
    category: 'Shirts' as ClothingCategory,
    fabric: '',
    description: '',
    wholesalePrice: 400,
    retailMrp: 1599,
    moq: 30,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    colors: 'Black, White, Navy',
    tags: 'Mill Fresh, High Margin',
    stockS: 50,
    stockM: 100,
    stockL: 100,
    stockXL: 50,
    stockXXL: 25,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.fabric) return;

    addProduct({
      name: formData.name,
      category: formData.category,
      fabric: formData.fabric,
      description: formData.description || 'Precision crafted wholesale garment.',
      wholesalePrice: Number(formData.wholesalePrice),
      retailMrp: Number(formData.retailMrp),
      moq: Number(formData.moq),
      image: formData.image,
      stock: {
        S: Number(formData.stockS),
        M: Number(formData.stockM),
        L: Number(formData.stockL),
        XL: Number(formData.stockXL),
        XXL: Number(formData.stockXXL),
      },
      colors: formData.colors.split(',').map(s => s.trim()),
      tags: formData.tags.split(',').map(s => s.trim()),
      rating: 4.8,
    });

    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      category: 'Shirts',
      fabric: '',
      description: '',
      wholesalePrice: 400,
      retailMrp: 1599,
      moq: 30,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      colors: 'Black, White, Navy',
      tags: 'Mill Fresh, High Margin',
      stockS: 50,
      stockM: 100,
      stockL: 100,
      stockXL: 50,
      stockXXL: 25,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      wholesalePrice: Number(editingProduct.wholesalePrice),
      retailMrp: Number(editingProduct.retailMrp),
      moq: Number(editingProduct.moq),
      fabric: editingProduct.fabric,
      description: editingProduct.description,
    });

    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Factory Garment Catalogue</h2>
          <p className="text-xs text-[#71717A]">
            Manage products, wholesale pricing rates, minimum order quantities (MOQ), and descriptions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white text-xs font-semibold shadow-md shadow-[#FF7135]/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Garment</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#17181C] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141519] border-b border-white/[0.08] text-[#71717A] font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fabric</th>
                <th className="py-3 px-4 text-center">MOQ</th>
                <th className="py-3 px-4 text-center">Ready Stock</th>
                <th className="py-3 px-4 text-right">Wholesale (₹)</th>
                <th className="py-3 px-4 text-right">Retail MRP</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {products.map(p => {
                const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-10 h-12 object-cover rounded-lg bg-[#101114] border border-white/10 shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-[#71717A] font-mono">{p.colors.join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono text-[10px] text-[#D4D4D8]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#A1A1AA] max-w-xs truncate font-mono text-[11px]">
                      {p.fabric}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {p.moq} pcs
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                      {totalStock} pcs
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#FF7135]">
                      ₹{p.wholesalePrice}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#71717A]">
                      ₹{p.retailMrp}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#FF7135] text-white transition-colors"
                        title="Edit product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#17181C] border border-white/15 p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add New Garment Line</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1">Garment Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Brushed Flannel Overshirt"
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                  >
                    <option value="Shirts">Shirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Denim">Denim</option>
                    <option value="Kurtis">Kurtis</option>
                    <option value="Trousers">Trousers</option>
                    <option value="Blazers">Blazers</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Dresses">Dresses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. 100% Ring Spun Cotton"
                    className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Wholesale (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">Retail MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.retailMrp}
                    onChange={(e) => setFormData({ ...formData, retailMrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">MOQ (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Initial Stock Matrix (S / M / L / XL / XXL)</label>
                <div className="grid grid-cols-5 gap-2">
                  <input type="number" value={formData.stockS} onChange={e => setFormData({ ...formData, stockS: Number(e.target.value) })} placeholder="S" className="px-2 py-1 text-center bg-[#101114] border border-white/10 rounded text-white" />
                  <input type="number" value={formData.stockM} onChange={e => setFormData({ ...formData, stockM: Number(e.target.value) })} placeholder="M" className="px-2 py-1 text-center bg-[#101114] border border-white/10 rounded text-white" />
                  <input type="number" value={formData.stockL} onChange={e => setFormData({ ...formData, stockL: Number(e.target.value) })} placeholder="L" className="px-2 py-1 text-center bg-[#101114] border border-white/10 rounded text-white" />
                  <input type="number" value={formData.stockXL} onChange={e => setFormData({ ...formData, stockXL: Number(e.target.value) })} placeholder="XL" className="px-2 py-1 text-center bg-[#101114] border border-white/10 rounded text-white" />
                  <input type="number" value={formData.stockXXL} onChange={e => setFormData({ ...formData, stockXXL: Number(e.target.value) })} placeholder="XXL" className="px-2 py-1 text-center bg-[#101114] border border-white/10 rounded text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Garment Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FF7135] text-white font-semibold shadow-md shadow-[#FF7135]/30"
                >
                  Publish to Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#17181C] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Edit Garment: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-[#A1A1AA] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1">Wholesale Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.wholesalePrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Minimum Order Quantity (MOQ)</label>
                <input
                  type="number"
                  value={editingProduct.moq}
                  onChange={(e) => setEditingProduct({ ...editingProduct, moq: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Fabric Description</label>
                <input
                  type="text"
                  value={editingProduct.fabric}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#101114] border border-white/10 text-white focus:outline-none focus:border-[#FF7135]"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FF7135] text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
