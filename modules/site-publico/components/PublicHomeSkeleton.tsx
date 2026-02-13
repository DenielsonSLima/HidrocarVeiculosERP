import React from 'react';

const PublicHomeSkeleton: React.FC = () => {
    return (
        <>
            {/* Skeleton Marcas */}
            <section className="py-16 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 flex items-baseline justify-between animate-pulse">
                        <div className="space-y-4">
                            <div className="h-3 w-32 bg-slate-200 rounded-full"></div>
                            <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
                        </div>
                        <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block"></div>
                        <div className="h-3 w-40 bg-slate-200 rounded-full hidden sm:block"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center h-[180px] animate-pulse"
                            >
                                <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded-full mb-2"></div>
                                <div className="h-4 w-8 bg-slate-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Skeleton Veículos */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 animate-pulse">
                        <div className="space-y-4">
                            <div className="h-3 w-40 bg-slate-200 rounded-full"></div>
                            <div className="h-12 w-80 bg-slate-200 rounded-lg"></div>
                        </div>
                        <div className="h-12 w-48 bg-slate-200 rounded-2xl"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden h-[450px] animate-pulse">
                                <div className="aspect-[16/10] bg-slate-200"></div>
                                <div className="p-7 flex flex-col flex-1 space-y-4">
                                    <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
                                    <div className="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                        <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                                    </div>
                                    <div className="mt-auto pt-6 flex items-end justify-between">
                                        <div className="space-y-2">
                                            <div className="h-3 w-12 bg-slate-200 rounded-full"></div>
                                            <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
                                        </div>
                                        <div className="h-14 w-14 bg-slate-200 rounded-[1.5rem]"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default PublicHomeSkeleton;
