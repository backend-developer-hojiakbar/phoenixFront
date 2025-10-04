import React from 'react';

interface ReportProps {
    userName: string;
    fileName: string;
    date: string;
    originality: number;
    plagiarism: number;
    sources: { similarity: number; link: string; type: string }[];
}

export const PlagiarismReport: React.FC<ReportProps> = ({ userName, fileName, date, originality, plagiarism, sources }) => {
  return (
    <div id="report-to-download" style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', backgroundColor: 'white', padding: '40px', fontFamily: 'Arial, sans-serif', color: 'black' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
            <div>
                <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>Hujjat tekshirish natijalari</h1>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Tekshiruvchi: {userName}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#555' }}>Hisobot "Antiplag.Uz" servisi tomonidan taqdim etilgan</p>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#005A8D' }}>ANTIPLAG</span>
        </header>

        <section style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ width: '48%' }}>
                <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '10px' }}>HUJJAT TO'G'RISIDAGI MA'LUMOTLAR</h2>
                <p style={{ fontSize: '14px' }}><strong>Yuklangan vaqti:</strong> {date}</p>
                <p style={{ fontSize: '14px' }}><strong>Fayl nomi:</strong> {fileName}</p>
            </div>
            <div style={{ width: '48%' }}>
                <h2 style={{ fontSize: '16px', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '10px' }}>HISOBOT TO'G'RISIDAGI MA'LUMOTLAR</h2>
                <p style={{ fontSize: '14px' }}><strong>Qidirish modullari:</strong> Search module INTERNET PLUS, eLIBRARY.RU va boshqalar</p>
            </div>
        </section>

        <section style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div><h3 style={{ margin: 0, fontSize: '14px' }}>O'ZLASHTIRIB OLISHLAR</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#D9534F', margin: '5px 0 0 0' }}>{plagiarism.toFixed(2)}%</p></div>
            <div><h3 style={{ margin: 0, fontSize: '14px' }}>O'Z-O'ZIDAN IQTIBOS</h3><p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0 0' }}>0%</p></div>
            <div><h3 style={{ margin: 0, fontSize: '14px' }}>IQTIBOSLAR</h3><p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0 0 0' }}>0%</p></div>
            <div><h3 style={{ margin: 0, fontSize: '14px' }}>ORIGINALLIK</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#5CB85C', margin: '5px 0 0 0' }}>{originality.toFixed(2)}%</p></div>
        </section>
        
        <section style={{ marginTop: '40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>№</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ulushi</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Manba</th>
                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Qidirish moduli</th>
                    </tr>
                </thead>
                <tbody>
                    {sources.map((source, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>[{String(index + 1).padStart(2, '0')}]</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', color: '#D9534F', fontWeight: 'bold' }}>{source.similarity.toFixed(2)}%</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd', wordBreak: 'break-all' }}>{source.link}</td>
                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{source.type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    </div>
  );
};