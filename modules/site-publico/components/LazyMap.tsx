
import React, { useState, useEffect, useRef } from 'react';

interface Props {
    src: string;
    title?: string;
}

const LazyMap: React.FC<Props> = ({ src, title = "Mapa" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Carrega 200px antes de aparecer
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-slate-100 flex items-center justify-center relative overlow-hidden"
        >
            {!isVisible ? (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] uppercase font-black tracking-widest">Carregando Mapa...</span>
                </div>
            ) : (
                <iframe
                    src={src}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title={title}
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full contrast-[1.1] transition-opacity duration-700 opacity-0 animate-fadeIn"
                    onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                />
            )}
        </div>
    );
};

export default LazyMap;
