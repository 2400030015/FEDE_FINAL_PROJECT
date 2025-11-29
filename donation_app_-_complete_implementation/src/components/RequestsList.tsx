import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

const categories = [
  "all", "clothing", "electronics", "furniture", "books", "toys", 
  "kitchen", "sports", "tools", "other"
];

const urgencyLevels = ["all", "low", "medium", "high", "urgent"];

export function RequestsList() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const requests = useQuery(api.requests.list, {
    category: selectedCategory,
    urgency: selectedUrgency,
    search: searchQuery || undefined,
  });
  
  const fulfillRequest = useMutation(api.requests.fulfill);

  const handleFulfill = async (requestId: Id<"requests">) => {
    try {
      await fulfillRequest({ requestId });
      toast.success("Thank you for helping! Contact the requester to arrange delivery.");
    } catch (error: any) {
      toast.error(error.message || "Failed to fulfill request");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (requests === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Requests</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search requests..."
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
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {urgencyLevels.map(urgency => (
              <option key={urgency} value={urgency}>
                {urgency === "all" ? "All Urgency" : urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== "all" || selectedUrgency !== "all"
                ? "Try adjusting your search or filters" 
                : "No one needs help right now!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {request.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{request.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Category:</span>
                    <span className="ml-1 capitalize">{request.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Location:</span>
                    <span className="ml-1">{request.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Requested by:</span>
                    <span className="ml-1">{request.requesterName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Posted:</span>
                    <span className="ml-1">{new Date(request._creationTime).toLocaleDateString()}</span>
                  </div>
                </div>

                {request.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {request.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleFulfill(request._id)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  I Can Help
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
