import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

const categories = [
  "all", "clothing", "electronics", "furniture", "books", "toys", 
  "kitchen", "sports", "tools", "other"
];

export function DonationsList() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const donations = useQuery(api.donations.list, {
    category: selectedCategory,
    search: searchQuery || undefined,
  });
  
  const reserveDonation = useMutation(api.donations.reserve);

  const handleReserve = async (donationId: Id<"donations">) => {
    try {
      await reserveDonation({ donationId });
      toast.success("Item reserved! Contact the donor to arrange pickup.");
    } catch (error: any) {
      toast.error(error.message || "Failed to reserve item");
    }
  };

  if (donations === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Donations</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Donations Grid */}
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filters" 
                : "Be the first to donate an item!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div key={donation._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {donation.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    donation.condition === "new" ? "bg-green-100 text-green-800" :
                    donation.condition === "like-new" ? "bg-blue-100 text-blue-800" :
                    donation.condition === "good" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {donation.condition}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{donation.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Category:</span>
                    <span className="ml-1 capitalize">{donation.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Location:</span>
                    <span className="ml-1">{donation.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Donor:</span>
                    <span className="ml-1">{donation.donorName}</span>
                  </div>
                </div>

                {donation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {donation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleReserve(donation._id)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Reserve Item
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
