import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Mail, ShieldCheck, Clock, Ban, FileText } from 'lucide-react';

const content = {
  terms: {
    title: 'Terms of Use',
    intro:
      'By using NovaShop, you agree to the following terms. Please read them carefully before purchasing any product.',
    sections: [
      {
        icon: Download,
        title: '1. Digital products only',
        body:
          'All products sold on NovaShop (bundles, boxes, supplier lists, guides, courses, etc.) are 100% digital. No physical item will ever be shipped. Once your payment is confirmed, you receive an email with a download link and access inside your account.',
      },
      {
        icon: Clock,
        title: '2. Instant delivery',
        body:
          'Delivery is automatic and immediate after payment. If you have not received your files within 15 minutes, please check your spam folder and contact us at support@novashop.com. We answer within 24 hours.',
      },
      {
        icon: Ban,
        title: '3. No refunds',
        body:
          'Because our products are digital and delivered instantly, all sales are final. Once you have downloaded, opened, or received access to a product, no refund can be issued. This is stated clearly at checkout and by accepting the terms popup on entering the site.',
      },
      {
        icon: ShieldCheck,
        title: '4. License & personal use',
        body:
          'Every product you buy is licensed to you personally. You may not resell, share, redistribute, upload publicly, or re-upload our files to any platform. Doing so may lead to legal action and permanent ban from NovaShop.',
      },
      {
        icon: FileText,
        title: '5. Accuracy of information',
        body:
          'We work hard to keep supplier lists and guides accurate and up to date. However NovaShop cannot guarantee availability, pricing or stock on third-party supplier websites. Reselling always carries risk and results are not guaranteed.',
      },
      {
        icon: Mail,
        title: '6. Contact',
        body:
          'For any question about these terms or your order, contact us at support@novashop.com. We are here to help.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'NovaShop respects your privacy. This policy describes what information we collect and how we use it.',
    sections: [
      {
        icon: FileText,
        title: '1. Data we collect',
        body:
          'When you place an order we collect your name, email address, billing information and order history. This is required to deliver your digital products and provide support.',
      },
      {
        icon: ShieldCheck,
        title: '2. How we use your data',
        body:
          'Your data is used only to process your order, deliver files, send order confirmations, and answer support requests. We never sell your data to third parties.',
      },
      {
        icon: Mail,
        title: '3. Marketing emails',
        body:
          'If you subscribe to our newsletter you may receive occasional emails about new drops and promotions. You can unsubscribe at any time by clicking the link at the bottom of any email.',
      },
      {
        icon: Ban,
        title: '4. Your rights',
        body:
          'You can request a copy or deletion of your personal data at any time by emailing support@novashop.com.',
      },
    ],
  },
  shipping: {
    title: 'Delivery Policy',
    intro:
      'Everything you need to know about how NovaShop delivers your orders.',
    sections: [
      {
        icon: Download,
        title: '100% Digital delivery',
        body:
          'NovaShop sells digital products only. There is no physical shipping, no tracking number, no package. You receive files (PDF, links, supplier lists, guides).',
      },
      {
        icon: Clock,
        title: 'When will I receive my order?',
        body:
          'Immediately after payment. An email is sent to the address used at checkout with a secure download link. Your files are also permanently available inside your NovaShop account.',
      },
      {
        icon: Mail,
        title: 'I did not receive my email',
        body:
          'Please check the spam / promotions folder first. If you still cannot find it after 15 minutes, contact support@novashop.com with your order number and we will resend it.',
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    intro:
      'Because NovaShop products are digital and delivered instantly, we have a strict no-refund policy.',
    sections: [
      {
        icon: Ban,
        title: 'All sales are final',
        body:
          'Once payment is confirmed and files are made available, no refund can be issued. This is standard practice for digital goods and it is confirmed by the terms popup you accept when entering the site, as well as at checkout.',
      },
      {
        icon: ShieldCheck,
        title: 'Duplicate purchase / technical issue',
        body:
          'If you accidentally purchased the same product twice, or if the files you received are broken, contact us at support@novashop.com within 48 hours and we will fix it for you (replacement or store credit).',
      },
    ],
  },
};

const Policy = () => {
  const { slug } = useParams();
  const page = content[slug];

  if (!page) {
    return (
      <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold uppercase">Page not found</h1>
        <Link to="/" className="inline-block mt-6 border border-black uppercase text-xs tracking-widest px-6 py-3 hover:bg-black hover:text-white transition-colors">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-14">
      <nav className="text-[11px] uppercase tracking-widest text-neutral-500 mb-6">
        <Link to="/" className="hover:text-black">Home</Link> / <span className="text-black">{page.title}</span>
      </nav>

      <header className="mb-10 pb-6 border-b border-neutral-200">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Policies</p>
        <h1 className="mt-2 text-3xl lg:text-5xl font-black uppercase tracking-tight" style={{ fontFamily: 'Archivo Black, Inter, sans-serif' }}>
          {page.title}
        </h1>
        <p className="mt-4 text-sm text-neutral-600 max-w-2xl leading-relaxed">{page.intro}</p>
      </header>

      {/* Highlighted digital delivery banner */}
      <div className="mb-10 bg-black text-white p-6 flex items-start gap-4">
        <Download className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-400">Important</p>
          <p className="mt-1 text-sm leading-relaxed">
            All products sold on NovaShop are <strong>100% digital</strong>. Nothing is physically shipped. Files are delivered by email instantly after payment.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {page.sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <section key={i} className="flex gap-5">
              <div className="w-10 h-10 border border-neutral-300 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-widest">{s.title}</h2>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.body}</p>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-14 pt-8 border-t border-neutral-200 text-center">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Need help?</p>
        <a
          href="mailto:support@novashop.com"
          className="inline-block bg-black text-white uppercase text-[12px] tracking-widest font-semibold px-8 py-4 hover:bg-neutral-800 transition-colors"
        >
          Contact support
        </a>
      </div>
    </div>
  );
};

export default Policy;
