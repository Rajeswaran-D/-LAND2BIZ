export default function AnalysisPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 uppercase">Food Processing Unit</h1>
          <p className="text-green-600 font-medium">Recommended</p>
        </div>
        <div className="text-4xl font-bold text-blue-700 bg-blue-50 p-4 rounded-lg">91 <span className="text-xl text-gray-500">/ 100</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Financials</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-gray-500 text-sm">Initial Investment</p><p className="font-medium">₹10,00,000</p></div>
              <div><p className="text-gray-500 text-sm">Working Capital</p><p className="font-medium">₹2,00,000</p></div>
              <div><p className="text-gray-500 text-sm">Owner Contribution</p><p className="font-medium">₹1,00,000</p></div>
              <div><p className="text-gray-500 text-sm">Loan Requirement</p><p className="font-medium">₹9,00,000</p></div>
              <div><p className="text-gray-500 text-sm">Break-even</p><p className="font-medium">2.8 Years</p></div>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">* Financial figures are estimates based on stated assumptions.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Risks</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-600">Demand Risk</span><span className="text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">Medium</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Competition Risk</span><span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Low</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Regulatory Uncertainty</span><span className="text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">Needs Verification</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sub-scores</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Site Suitability</span><span className="font-bold">94</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Local Demand</span><span className="font-bold">88</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Competition</span><span className="font-bold">82</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Market Gap</span><span className="font-bold">93</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Financial Feasibility</span><span className="font-bold">86</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Government Support</span><span className="font-bold">90</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between"><span className="text-gray-900 font-medium">Confidence</span><span className="font-bold text-blue-600">84</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
