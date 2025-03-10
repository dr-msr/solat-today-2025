import { useState } from 'react';
import { GetSolatResponses } from "@/app/api/getSolat/route";
import { cap1st } from "@/lib/utils";
import { Badge } from './ui/badge';

interface MasjidListProps {
    masjid: GetSolatResponses["masjid"][]
}

const MasjidList = ({ masjid }: MasjidListProps) => {
    // State for the masjid details modal
    const [selectedMasjid, setSelectedMasjid] = useState<GetSolatResponses["masjid"] | null>(null);

    // Function to open the details modal
    const openDetailsModal = (masjidItem: GetSolatResponses["masjid"]) => {
        setSelectedMasjid(masjidItem);
    };

    // Function to close the details modal
    const closeDetailsModal = () => {
        setSelectedMasjid(null);
    };
    


    return (
        <div className="relative">
            <div className="border border-gray-300 bg-white rounded-lg shadow-lg w-full p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Nearby Masjids</h2>
                <div className="space-y-3">
                    {masjid.map((item) => (
                        <div 
                            key={item.no_daftar} 
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors gap-2"
                        >
                            <div className="flex-1 flex gap-2 items-center">
                                <div className="text-sm font-medium text-gray-800">{cap1st(item.nama_masjid)}</div>
                            </div>
                            <Badge variant="outline" className="hover:bg-green-600">
                                {parseFloat(item.distance).toFixed(2)} km
                            </Badge>
                            <Badge 
                                onClick={() => openDetailsModal(item)}
                            >
                                Details
                            </Badge>
                        </div>
                    ))}
                    <div 
                        className="flex flex-col bg-gray-100 sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors gap-2"
                    >
                        <div className="flex-1 flex gap-2 items-center ">
                            <div className="text-sm font-medium text-gray-800">The list is curated by JAKIM</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Masjid Details Modal */}
            {selectedMasjid && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="text-md font-bold text-gray-800">{cap1st(selectedMasjid.nama_masjid)}</div>
                                <button 
                                    onClick={closeDetailsModal}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-4 space-y-3">
                                {selectedMasjid.distance !== undefined && (
                                    <p className="text-sm"><span className="font-medium">Distance:</span> {parseFloat(selectedMasjid.distance).toFixed(2)} km</p>
                                )}
                                {selectedMasjid.no_daftar && (
                                    <p className="text-sm"><span className="font-medium">Registration Number:</span> {selectedMasjid.no_daftar}</p>
                                )}
                                {selectedMasjid.alamat && (
                                    <p className="text-sm"><span className="font-medium">Address:</span> {selectedMasjid.alamat}</p>
                                )}
                                {selectedMasjid.jalan && (
                                    <p className="text-sm"><span className="font-medium">Street:</span> {selectedMasjid.jalan}</p>
                                )}
                                {selectedMasjid.kampung && (
                                    <p className="text-sm"><span className="font-medium">Village:</span> {selectedMasjid.kampung}</p>
                                )}
                                {selectedMasjid.daerah && (
                                    <p className="text-sm"><span className="font-medium">District:</span> {selectedMasjid.daerah}</p>
                                )}
                                {selectedMasjid.negeri && (
                                    <p className="text-sm"><span className="font-medium">State:</span> {selectedMasjid.negeri}</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3">
                            <button 
                                onClick={closeDetailsModal}
                                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasjidList;