import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function UserDashboard() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userDonations = useQuery(api.donations.getUserDonations);
  const userRequests = useQuery(api.requests.getUserRequests);
  const completeDonation = useMutation(api.donations.complete);

  const handleCompleteDonation = async (donationId: Id<"donations">) => {
    try {
      await completeDonation({ donationId });
      toast.success("Donation marked as completed!");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete donation");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "open": return "bg-blue-100 text-blue-800";
      case "fulfilled": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!loggedInUser || userDonations === undefined || userRequests === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{userDonations.length}</div>
            <div className="text-sm text-gray-600">Items Donated</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{userRequests.length}</div>
            <div className="text-sm text-gray-600">Help Requests</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {userDonations.filter(d => d.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed Donations</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {userRequests.filter(r => r.status === "fulfilled").length}
            </div>
            <div className="text-sm text-gray-600">Fulfilled Requests</div>
          </div>
        </div>
      </div>

      {/* My Donations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Donations</h3>
        {userDonations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600">You haven't donated any items yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userDonations.map((donation) => (
              <div key={donation._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{donation.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{donation.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Posted {new Date(donation._creationTime).toLocaleDateString()}
                  </div>
                  {donation.status === "reserved" && (
                    <button
                      onClick={() => handleCompleteDonation(donation._id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Requests</h3>
        {userRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-gray-600">You haven't made any requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userRequests.map((request) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{request.title}</h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.urgency === "urgent" ? "bg-red-100 text-red-800" :
                      request.urgency === "high" ? "bg-orange-100 text-orange-800" :
                      request.urgency === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {request.urgency}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                <div className="text-xs text-gray-500">
                  Posted {new Date(request._creationTime).toLocaleDateString()}
                  {request.fulfilledAt && (
                    <span className="ml-2">
                      • Fulfilled {new Date(request.fulfilledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
