'use client';

import { useState } from 'react';
import { GetSolatResponses } from "@/app/actions/getSolat";
import { cap1st } from "@/lib/utils";
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR issues with Leaflet
// We use dynamic import with ssr: false to ensure Leaflet only loads on the client side
const MasjidMap = dynamic(() => import('./masjidMap'), { ssr: false });

// Interface for the translation state
interface TranslationState {
    sejarah: string | null;
    binaan: string | null;
    kemudahan: string | null;
    istimewa: string | null;
    lokasi: string | null;
    isLoading: {
        sejarah: boolean;
        binaan: boolean;
        kemudahan: boolean;
        istimewa: boolean;
        lokasi: boolean;
    };
}

interface MasjidListProps {
    masjid: GetSolatResponses["masjid"][]
}

const MasjidList = ({ masjid }: MasjidListProps) => {
    // State for the masjid details modal
    const [selectedMasjid, setSelectedMasjid] = useState<GetSolatResponses["masjid"] | null>(null);
    
    // State for storing translations
    const [translations, setTranslations] = useState<TranslationState>({
        sejarah: null,
        binaan: null,
        kemudahan: null,
        istimewa: null,
        lokasi: null,
        isLoading: {
            sejarah: false,
            binaan: false,
            kemudahan: false,
            istimewa: false,
            lokasi: false,
        }
    });

    // Function to open the details modal
    const openDetailsModal = (masjidItem: GetSolatResponses["masjid"]) => {
        setSelectedMasjid(masjidItem);
    };

    // Function to close the details modal
    const closeDetailsModal = () => {
        setSelectedMasjid(null);
        // Reset translations when closing the modal
        setTranslations({
            sejarah: null,
            binaan: null,
            kemudahan: null,
            istimewa: null,
            lokasi: null,
            isLoading: {
                sejarah: false,
                binaan: false,
                kemudahan: false,
                istimewa: false,
                lokasi: false,
            }
        });
    };
    
    // Function to translate text
    const handleTranslate = async (text: string, field: keyof Omit<TranslationState, 'isLoading'>) => {
        if (!text || text.trim() === '') return;
        
        try {
            // Set loading state for the specific field
            setTranslations(prev => ({
                ...prev,
                isLoading: {
                    ...prev.isLoading,
                    [field]: true
                }
            }));
            
            // Import and call the server action
            const { translateText } = await import('@/app/actions/translate');
            const translatedText = await translateText(text);
            
            // Update the translation for the specific field
            setTranslations(prev => ({
                ...prev,
                [field]: translatedText,
                isLoading: {
                    ...prev.isLoading,
                    [field]: false
                }
            }));
        } catch (error) {
            console.error('Failed to translate:', error);
            // Reset loading state on error
            setTranslations(prev => ({
                ...prev,
                isLoading: {
                    ...prev.isLoading,
                    [field]: false
                }
            }));
        }
    };



    return (
        <div className="relative">
            <div className="border border-gray-300 bg-white rounded-lg shadow-lg w-full p-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Nearby Masjids</h2>
                <div className="space-y-3">
                    <div
                        className="flex flex-col bg-gray-100 sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors gap-2"
                    >
                        <div className="flex-1 flex gap-2 items-center ">
                            <div className="w-full flex flex-row justify-between items-center">
                                <div className="text-sm font-medium text-gray-800">Refresh the location to get the nearest masjid list.</div>
                            </div>
                        </div>
                    </div>
                    {masjid.map((item) => (
                        <div
                            key={item.no_daftar}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors gap-2"
                        >
                            <div className="flex-1 flex gap-2 items-center">
                                <div className="text-sm font-medium text-gray-800">{cap1st(item.nama_masjid)}</div>
                            </div>
                            <div className="flex flex-row gap-1 self-end">
                                <Badge variant="outline" className="hover:bg-green-600">
                                    {parseFloat(item.distance).toFixed(2)} km
                                </Badge>
                                <Badge
                                    onClick={() => openDetailsModal(item)}
                                >
                                    Details
                                </Badge>
                            </div>
                        </div>
                    ))}
                    <div
                        className="flex flex-col bg-gray-100 sm:flex-row justify-between items-start sm:items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors gap-2"
                    >
                        <div className="flex-1 flex gap-2 items-center ">
                            <div className="text-sm font-medium text-gray-800">The list is curated by JAKIM.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Masjid Details Modal */}
            {selectedMasjid && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4">
                            <div className="flex justify-between mb-4">
                                <div className="flex flex-col items-start">
                                    <div className="text-md font-bold text-gray-800">{cap1st(selectedMasjid.nama_masjid)}</div>
                                    <div className="text-xs text-muted-foreground text-left">{cap1st(selectedMasjid.alamat)}</div>
                                </div>
                                <button
                                    onClick={closeDetailsModal}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <Tabs defaultValue="info" className="w-full">
                                <TabsList className="w-full mb-4 flex justify-evenly text-xs gap-1">
                                    <TabsTrigger value="info" className="w-full px-1">Overview</TabsTrigger>
                                    <TabsTrigger value="history" className="w-full px-1">Info</TabsTrigger>
                                    <TabsTrigger value="facilities" className="w-full px-1">Facilities</TabsTrigger>
                                    <TabsTrigger value="contact" className="w-full px-1">Contact</TabsTrigger>
                                    <TabsTrigger value="map" className="w-full px-1">Map</TabsTrigger>
                                </TabsList>

                                {/* Basic Info Tab */}
                                <TabsContent value="info" className="space-y-4">
                                    <div className="space-y-3">
                                        {selectedMasjid.distance !== undefined && (
                                            <p className="text-sm flex flex-row justify-between px-4"><span className="font-medium">Distance:</span> <Badge variant="outline">{parseFloat(selectedMasjid.distance).toFixed(2)} km</Badge></p>
                                        )}
                                        {selectedMasjid.no_daftar && (
                                            <p className="text-sm flex flex-row justify-between px-4"><span className="font-medium">JAKIM Registration Number:</span> <Badge variant="outline">{selectedMasjid.no_daftar}</Badge></p>
                                        )}
                                        {selectedMasjid.poskod && (
                                            <p className="text-sm flex flex-row justify-between px-4"><span className="font-medium">Postal Code:</span> <Badge variant="outline">{selectedMasjid.poskod}</Badge></p>
                                        )}
                                        {selectedMasjid.kapasiti > 0 && (
                                            <p className="text-sm flex flex-row justify-between px-4"><span className="font-medium">Capacity:</span> <Badge variant="outline">{selectedMasjid.kapasiti} pax</Badge></p>
                                        )}
                                        {selectedMasjid.dt_rasmi && selectedMasjid.dt_rasmi !== "0000-00-00" && (
                                            <p className="text-sm flex flex-row justify-between px-4 items-start">
                                                <span className="font-medium shrink-0 mr-2">Official Date:</span>
                                                <Badge variant="outline" className="text-wrap text-right whitespace-normal ml-auto">{selectedMasjid.dt_rasmi}</Badge>
                                            </p>
                                        )}
                                        {selectedMasjid.rasmi && (
                                            <p className="text-sm flex flex-col items-center justify-between px-4 items-start gap-2">
                                                <span className="font-medium shrink-0 mr-2">Officialized By:</span> 
                                                <Badge variant="outline" className="text-wrap self-center whitespace-normal">{selectedMasjid.rasmi}</Badge>
                                            </p>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* History Tab */}
                                <TabsContent value="history" className="space-y-4">
                                    {(selectedMasjid.sejarah && selectedMasjid.sejarah.trim() !== "") || 
                                     (selectedMasjid.binaan && selectedMasjid.binaan.trim() !== "") || 
                                     (selectedMasjid.dt_bina && selectedMasjid.dt_bina !== "0000-00-00") || 
                                     (selectedMasjid.kos && parseFloat(selectedMasjid.kos) > 0) ? (
                                        <>
                                            {selectedMasjid.sejarah && selectedMasjid.sejarah.trim() !== "" && (
                                                <div className="flex flex-col space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <Badge className="text-sm font-medium text-left">History</Badge>
                                                        <button 
                                                            onClick={() => handleTranslate(selectedMasjid.sejarah, 'sejarah')}
                                                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"
                                                            disabled={translations.isLoading.sejarah}
                                                        >
                                                            {translations.isLoading.sejarah ? (
                                                                <span>Translating...</span>
                                                            ) : translations.sejarah ? (
                                                                <span>Show Original</span>
                                                            ) : (
                                                                <span>Translate</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="border p-2 rounded text-sm whitespace-pre-line">
                                                        {translations.sejarah && !translations.isLoading.sejarah ? translations.sejarah : selectedMasjid.sejarah}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedMasjid.binaan && selectedMasjid.binaan.trim() !== "" && (
                                                <div className="flex flex-col space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <Badge className="text-sm font-medium text-left">Building Information</Badge>
                                                        <button 
                                                            onClick={() => handleTranslate(selectedMasjid.binaan, 'binaan')}
                                                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"
                                                            disabled={translations.isLoading.binaan}
                                                        >
                                                            {translations.isLoading.binaan ? (
                                                                <span>Translating...</span>
                                                            ) : translations.binaan ? (
                                                                <span>Show Original</span>
                                                            ) : (
                                                                <span>Translate</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="border p-2 rounded text-sm whitespace-pre-line">
                                                        {translations.binaan && !translations.isLoading.binaan ? translations.binaan : selectedMasjid.binaan}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedMasjid.dt_bina && selectedMasjid.dt_bina !== "0000-00-00" && (
                                                <p className="flex flex-row justify-between text-sm"><Badge className="text-sm font-medium">Construction Date :</Badge> <Badge variant="outline">{selectedMasjid.dt_bina}</Badge></p>
                                            )}

                                            {selectedMasjid.kos && parseFloat(selectedMasjid.kos) > 0 && (
                                                <p className="flex flex-row justify-between text-sm"><Badge className="text-sm font-medium">Cost of Construction :</Badge> <Badge variant="outline">RM {parseFloat(selectedMasjid.kos).toLocaleString()}</Badge></p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No historical information available</p>
                                    )}
                                </TabsContent>

                                {/* Facilities Tab */}
                                <TabsContent value="facilities" className="space-y-4">
                                    {selectedMasjid.kemudahan ? (
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Badge className="text-sm font-medium text-left">Facilities</Badge>
                                                <button 
                                                    onClick={() => handleTranslate(selectedMasjid.kemudahan, 'kemudahan')}
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"
                                                    disabled={translations.isLoading.kemudahan}
                                                >
                                                    {translations.isLoading.kemudahan ? (
                                                        <span>Translating...</span>
                                                    ) : translations.kemudahan ? (
                                                        <span>Show Original</span>
                                                    ) : (
                                                        <span>Translate</span>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="border p-2 rounded text-sm whitespace-pre-line">
                                                {translations.kemudahan && !translations.isLoading.kemudahan ? translations.kemudahan : selectedMasjid.kemudahan}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No facilities information available</p>
                                    )}

                                    {selectedMasjid.istimewa && (
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Badge className="text-sm font-medium text-left">Special Attributes</Badge>
                                                <button 
                                                    onClick={() => handleTranslate(selectedMasjid.istimewa, 'istimewa')}
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"
                                                    disabled={translations.isLoading.istimewa}
                                                >
                                                    {translations.isLoading.istimewa ? (
                                                        <span>Translating...</span>
                                                    ) : translations.istimewa ? (
                                                        <span>Show Original</span>
                                                    ) : (
                                                        <span>Translate</span>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="border p-2 rounded text-sm whitespace-pre-line">
                                                {translations.istimewa && !translations.isLoading.istimewa ? translations.istimewa : selectedMasjid.istimewa}
                                            </div>
                                        </div>
                                    )}

                                    {selectedMasjid.luas_tanah > 0 && (
                                        <p className="flex flex-row justify-between text-sm"><Badge className="font-medium">Land Area :</Badge> <Badge variant="outline">{selectedMasjid.luas_tanah} acres</Badge></p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedMasjid.chk_pelancongan === "1" && <Badge variant="outline">Tourism Site</Badge>}
                                        {selectedMasjid.chk_warisan === "1" && <Badge variant="outline">Heritage Site</Badge>}
                                        {selectedMasjid.chk_khairuljamek === "1" && <Badge variant="outline">Khairul Jamek</Badge>}
                                    </div>
                                </TabsContent>

                                {/* Contact Tab */}
                                <TabsContent value="contact" className="space-y-4">
                                    {(selectedMasjid.tel || selectedMasjid.fax || selectedMasjid.email || selectedMasjid.url_website) ? (
                                        <div className="space-y-3">
                                            {selectedMasjid.tel && (
                                                <p className="flex flex-row justify-between text-sm"><Badge className="font-medium">Telephone :</Badge> {selectedMasjid.tel}</p>
                                            )}
                                            {selectedMasjid.fax && (
                                                <p className="flex flex-row justify-between text-sm"><Badge className="font-medium">Fax :</Badge> {selectedMasjid.fax}</p>
                                            )}
                                            {selectedMasjid.email && (
                                                <p className="flex flex-row justify-between text-sm items-start">
                                                    <Badge className="font-medium">Email:</Badge>
                                                    <span className="text-wrap text-right whitespace-normal ml-auto break-all">{selectedMasjid.email}</span>
                                                </p>
                                            )}
                                            {selectedMasjid.url_website && (
                                                <p className="flex flex-row justify-between text-sm items-start">
                                                    <Badge className="font-medium">Website:</Badge>
                                                    <a href={selectedMasjid.url_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-wrap text-right whitespace-normal ml-auto break-all">{selectedMasjid.url_website}</a>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No contact information available</p>
                                    )}
                                </TabsContent>

                                {/* Map Tab */}
                                <TabsContent value="map" className="space-y-4">
                                    {selectedMasjid.latitud && selectedMasjid.longitud ? (
                                        <MasjidMap
                                            lat={selectedMasjid.latitud}
                                            lng={selectedMasjid.longitud}
                                            name={selectedMasjid.nama_masjid}
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No location coordinates available</p>
                                    )}

                                    {selectedMasjid.lokasi && (
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Badge className="text-sm font-medium text-left">Location Description</Badge>
                                                <button 
                                                    onClick={() => handleTranslate(selectedMasjid.lokasi, 'lokasi')}
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"
                                                    disabled={translations.isLoading.lokasi}
                                                >
                                                    {translations.isLoading.lokasi ? (
                                                        <span>Translating...</span>
                                                    ) : translations.lokasi ? (
                                                        <span>Show Original</span>
                                                    ) : (
                                                        <span>Translate</span>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="border p-2 rounded text-sm whitespace-pre-line">
                                                {translations.lokasi && !translations.isLoading.lokasi ? translations.lokasi : selectedMasjid.lokasi}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
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