import React from 'react';
import { ArrowLeft, Download, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SchemeGuides.css';

const guides = [
    {
        title: 'Post-Matric Scholarship for SC Students',
        tag: 'SC',
        summary: 'A plain-language overview of the Scheduled Caste post-matric scheme, based on the March 2021 guideline edition supplied for this portal.',
        file: '/guides/post-matric-sc-student-guide.pdf',
        edition: 'Source edition: March 2021; stated coverage 2020-21 to 2025-26',
    },
    {
        title: 'Post-Matric Scholarship for OBC, EBC and DNT Students',
        tag: 'OBC / EBC / DNT',
        summary: 'A plain-language overview of the centrally sponsored post-matric scheme, based on the guideline document supplied for this portal.',
        file: '/guides/post-matric-obc-student-guide.pdf',
        edition: 'Source edition: document supplied for this portal; verify the applicable academic-year rules',
    },
];

export default function SchemeGuides() {
    return (
        <main className="scheme-guides-page">
            <header className="scheme-guides-header">
                <Link to="/" className="scheme-guides-back"><ArrowLeft size={16} /> Portal home</Link>
                <span className="scheme-guides-brand"><GraduationCap size={21} /> Scholarship Portal</span>
            </header>
            <section className="scheme-guides-hero">
                <span className="scheme-guides-eyebrow">STUDENT REFERENCE</span>
                <h1>Post-matric scholarship guides</h1>
                <p>Read a short overview and download a redesigned summary for each scholarship group.</p>
            </section>
            <section className="scheme-guides-list" aria-label="Scholarship scheme guides">
                {guides.map((guide) => (
                    <article className="scheme-guide-card" key={guide.tag}>
                        <div className="scheme-guide-card-top">
                            <span className="scheme-guide-icon"><FileText size={21} /></span>
                            <span className="scheme-guide-tag">{guide.tag}</span>
                        </div>
                        <h2>{guide.title}</h2>
                        <p>{guide.summary}</p>
                        <small>{guide.edition}</small>
                        <div className="scheme-guide-actions">
                            <a className="scheme-guide-download" href={guide.file} download><Download size={16} /> Download summary</a>
                        </div>
                    </article>
                ))}
            </section>
            <p className="scheme-guides-note">These independently prepared summaries are for general information. They are not government publications and do not determine eligibility or award amounts. Rules, application windows, documents and payment levels can change and may vary by State/UT. Confirm the current academic-year requirements with the relevant State/UT scholarship authority before applying.</p>
        </main>
    );
}
