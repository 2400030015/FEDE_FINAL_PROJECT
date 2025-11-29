import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { DonationsList } from "./components/DonationsList";
import { RequestsList } from "./components/RequestsList";
import { CreateDonation } from "./components/CreateDonation";
import { CreateRequest } from "./components/CreateRequest";
import { UserDashboard } from "./components/UserDashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("donations");
  const [showCreateDonation, setShowCreateDonation] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-indigo-600">💧 Hope Drop</h1>
              <Authenticated>
                <nav className="hidden md:flex space-x-6">
                  <button
                    onClick={() => setActiveTab("donations")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "donations"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    Available Items
                  </button>
                  <button
                    onClick={() => setActiveTab("requests")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "requests"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    Help Requests
                  </button>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    My Activity
                  </button>
                </nav>
              </Authenticated>
            </div>
            <div className="flex items-center space-x-4">
              <Authenticated>
                <button
                  onClick={() => setShowCreateDonation(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                  Donate Item
                </button>
                <button
                  onClick={() => setShowCreateRequest(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Request Help
                </button>
              </Authenticated>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showCreateDonation={showCreateDonation}
          setShowCreateDonation={setShowCreateDonation}
          showCreateRequest={showCreateRequest}
          setShowCreateRequest={setShowCreateRequest}
        />
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}

function Content({ 
  activeTab, 
  setActiveTab, 
  showCreateDonation, 
  setShowCreateDonation,
  showCreateRequest,
  setShowCreateRequest
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showCreateDonation: boolean;
  setShowCreateDonation: (show: boolean) => void;
  showCreateRequest: boolean;
  setShowCreateRequest: (show: boolean) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Drop Hope. Share Care.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join Hope Drop, where every donation creates ripples of kindness. Share what you have 
              or find help when you need it most.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">Drop Items</h3>
                <p className="text-gray-600">Share items you no longer need with those who do</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-lg font-semibold mb-2">Find Hope</h3>
                <p className="text-gray-600">Request assistance when you need essential items</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-3xl mb-4">💝</div>
                <h3 className="text-lg font-semibold mb-2">Spread Kindness</h3>
                <p className="text-gray-600">Connect with neighbors and make a difference</p>
              </div>
            </div>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Navigation */}
          <div className="md:hidden mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("donations")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "donations"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600"
                }`}
              >
                Items
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "requests"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600"
                }`}
              >
                Requests
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600"
                }`}
              >
                My Activity
              </button>
            </div>
          </div>

          {activeTab === "donations" && <DonationsList />}
          {activeTab === "requests" && <RequestsList />}
          {activeTab === "dashboard" && <UserDashboard />}
        </div>
      </Authenticated>

      {showCreateDonation && (
        <CreateDonation onClose={() => setShowCreateDonation(false)} />
      )}

      {showCreateRequest && (
        <CreateRequest onClose={() => setShowCreateRequest(false)} />
      )}
    </>
  );
}
