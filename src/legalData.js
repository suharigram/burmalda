const updated = 'October 28, 2026';
const doc = (title, description, sections) => ({ title, description, updated, sections });

export const legalDocuments = {
  '/legal/privacy': doc('Privacy Policy', 'How GonidonCloud collects, uses, protects, and shares personal information.', [
    { heading: '1. Scope and controller', paragraphs: ['This Policy applies to GonidonCloud websites, product registrations, sales interactions, support services, events, and business communications. GonidonCloud, Inc. acts as the controller for the processing described here unless a different entity is identified in a contract or local privacy notice.'] },
    { heading: '2. Information we collect', paragraphs: ['We collect information you provide directly, information generated during transactions and support, and limited technical information about site use.'], list: ['Identity and professional details, including name, business email, company, and role.', 'Transaction, shipping, billing, warranty, and support records.', 'Communications, preferences, and information submitted through forms.', 'Device, log, security, and cookie data as described in our Cookies Policy.', 'Information from partners, resellers, and public business sources where permitted.'] },
    { heading: '3. How we use information', paragraphs: ['We use information to respond to inquiries, provide and improve products, process orders, deliver support, secure our services, meet legal obligations, and send communications you have requested. Where required, we rely on consent; otherwise processing may be based on contract performance, legitimate interests, or legal obligations.'] },
    { heading: '4. Sharing and international transfers', paragraphs: ['We may share information with GonidonCloud affiliates, service providers, payment processors, logistics providers, professional advisers, and authorized partners acting on our behalf. We do not sell personal information for money. International transfers are protected by appropriate contractual and organizational safeguards where required.'] },
    { heading: '5. Retention and security', paragraphs: ['We retain information only as long as necessary for the purposes described, including contract, warranty, accounting, dispute, and compliance requirements. We use administrative, technical, and physical safeguards, but no online system can be guaranteed completely secure.'] },
    { heading: '6. Your rights and choices', paragraphs: ['Depending on your location, you may request access, correction, deletion, portability, restriction, or objection, and may withdraw consent or opt out of marketing. We will verify and respond to requests as required by applicable law.'], links: [{ label: 'Submit a privacy request', to: '/legal/privacy-choices' }] },
    { heading: '7. Children and policy updates', paragraphs: ['Our business sites and services are not directed to children, and we do not knowingly collect their personal information. Material changes to this Policy will be posted here with a revised date and, where required, additional notice.'] },
    { heading: '8. Contact', paragraphs: ['For privacy questions or requests, contact privacy@gonidoncloud.com. You may also complain to your local data protection authority.'] },
  ]),
  '/legal/terms': doc('Terms of Use / Copyright', 'The terms that govern access to this website and its content.', [
    { heading: '1. Acceptance and permitted use', paragraphs: ['By using this website, you agree to these Terms and applicable law. We grant a limited, non-exclusive, revocable right to access the site for lawful business and informational purposes. Separate agreements govern products, software, and confidential materials.'] },
    { heading: '2. Intellectual property', paragraphs: ['The site and its text, designs, graphics, software, and other materials are owned by GonidonCloud or its licensors and are protected by intellectual-property laws. No ownership rights transfer to you. You may share unmodified product information internally for evaluation, provided all notices are preserved.'] },
    { heading: '3. Prohibited conduct', list: ['Do not interfere with the site, bypass security, introduce malicious code, or use automated scraping that creates unreasonable load.', 'Do not misrepresent affiliation, remove proprietary notices, or use site content to train a commercial model without written permission.', 'Do not use the site or its materials for unlawful, infringing, deceptive, or prohibited end uses.'] },
    { heading: '4. Third-party content and links', paragraphs: ['Third-party names, links, and materials are provided for convenience and remain subject to their owners’ terms. GonidonCloud does not control and is not responsible for third-party websites.'] },
    { heading: '5. Disclaimers and liability', paragraphs: ['Website materials are provided “as is” for general information and may change without notice. To the extent permitted by law, GonidonCloud disclaims implied warranties relating to the website and is not liable for indirect or consequential damages arising solely from website use. Product warranties and liabilities are governed by the applicable sale or license agreement.'] },
    { heading: '6. Copyright concerns and contact', paragraphs: ['For permission requests or a good-faith copyright notice, contact legal@gonidoncloud.com with identification of the work, the material at issue, your contact information, and a statement of good-faith belief and authority to act.'] },
  ]),
  '/legal/trademarks': doc('Trademarks & Brand Use', 'Guidelines for referring to GonidonCloud products and brands.', [
    { heading: 'Our marks', paragraphs: ['GonidonCloud, the GonidonCloud geometric mark, FPU, Apollon, Force, FlowForce, and FlowSystem, and associated product names and logos are trademarks or claimed trademarks of GonidonCloud, Inc. Registration status varies by jurisdiction.'] },
    { heading: 'Permitted references', paragraphs: ['You may use product names in plain text to truthfully identify compatibility or refer to genuine products. Use the appropriate ™ or ® designation where known, include the attribution “GonidonCloud and its product marks are trademarks of GonidonCloud, Inc.,” and do not imply sponsorship or endorsement.'] },
    { heading: 'Restrictions', list: ['Do not use our marks in your company, product, domain, or social-media name without written permission.', 'Do not alter logos, imitate trade dress, or use marks in a misleading or disparaging manner.', 'Third-party marks belong to their respective owners and do not imply partnership or endorsement.'] },
    { heading: 'Permissions', paragraphs: ['Brand assets, when supplied, are licensed only under their accompanying terms. Requests for other uses may be sent to brand@gonidoncloud.com.'] },
  ]),
  '/legal/cookies': doc('Cookies Policy', 'How we use cookies and similar technologies, and how you can control them.', [
    { heading: '1. What cookies are', paragraphs: ['Cookies are small files or similar local-storage technologies that help a website remember information about your visit. We use limited browser storage for theme, cookie choices, security, and essential site operation.'] },
    { heading: '2. Categories', list: ['Strictly necessary: security, load balancing, form protection, and remembering privacy choices. These cannot be disabled through our preference center.', 'Functional: optional conveniences such as remembering nonessential preferences.', 'Analytics: aggregated audience measurement. These are used only with consent where required.', 'Advertising: campaign measurement or personalization. We do not enable this category without your consent.'] },
    { heading: '3. Third parties and retention', paragraphs: ['If enabled with your permission, analytics or embedded service providers may process limited technical information under their own privacy terms. Cookie lifetimes vary from session-only to no more than 13 months unless a shorter period is required by law.'] },
    { heading: '4. Your controls', paragraphs: ['You can change optional categories at any time through Cookie Settings or your browser. Blocking necessary storage may affect site functionality.'], links: [{ label: 'Read our Privacy Policy', to: '/legal/privacy' }] },
  ]),
  '/legal/supply-chain': doc('Supply Chain Transparency', 'Our approach to responsible sourcing, labor, and supplier accountability.', [
    { heading: 'Our commitment', paragraphs: ['GonidonCloud prohibits forced, bonded, prison, and child labor, human trafficking, and retaliation in its operations and supply chain. We expect suppliers to provide safe conditions, lawful wages, freedom of association, and respectful treatment.'] },
    { heading: 'Due diligence', paragraphs: ['We assess supplier risk, conduct onboarding and contractual review, request corrective action where needed, and may audit higher-risk suppliers. We seek traceability for relevant minerals and expect environmental and trade-law compliance.'] },
    { heading: 'Reporting and remediation', paragraphs: ['Concerns may be reported confidentially to ethics@gonidoncloud.com. We prohibit retaliation for good-faith reports and prioritize remediation and worker protection over concealment.'] },
    { heading: 'Modern slavery disclosure', paragraphs: ['This statement describes our current program and is intended to support applicable supply-chain transparency requirements. Entity-specific statutory statements will be published where required.'] },
  ]),
  '/legal/competition': doc('Fair & Open Competition', 'Our commitment to lawful competition and unbiased procurement.', [
    { heading: 'Competing on merit', paragraphs: ['We compete through performance, efficiency, openness, and customer value. We do not agree with competitors to fix prices, divide markets, restrict output, or rig bids.'] },
    { heading: 'Customers and public procurement', paragraphs: ['We support interoperable standards and technology-neutral specifications that permit genuine component-level choice. Customers should evaluate complete workloads and lifecycle value rather than specifications designed to exclude competitors.'] },
    { heading: 'Partners and employees', paragraphs: ['Partners and employees must gather competitive intelligence lawfully, respect confidential information, avoid misleading comparisons, and complete competition-law training appropriate to their roles. Questions may be sent to compliance@gonidoncloud.com.'] },
  ]),
  '/legal/tax-strategy': doc('Tax Strategy (UK)', 'Our approach to tax governance, risk, planning, and transparency.', [
    { heading: 'Scope and governance', paragraphs: ['This strategy applies to GonidonCloud entities and operations subject to UK tax. Finance leadership oversees tax governance with oversight from executive management and professional advisers.'] },
    { heading: 'Risk and planning', paragraphs: ['We manage tax risk through documented controls and seek advice on material uncertainty. We claim available reliefs and incentives in the manner intended by law but do not pursue artificial arrangements lacking commercial substance.'] },
    { heading: 'Risk appetite and HMRC', paragraphs: ['We maintain a low appetite for deliberate noncompliance and engage with tax authorities, including HMRC where applicable, in a timely, transparent, and cooperative manner. This statement is reviewed annually.'] },
  ]),
  '/legal/terms-of-sale': doc('Terms of Sale', 'Commercial terms for hardware, systems, and related services purchased from GonidonCloud.', [
    { heading: '1. Orders and contract formation', paragraphs: ['An order is an offer to purchase. A contract forms only when GonidonCloud accepts it in writing. Product configuration, quantity, price, delivery term, and entity details in the accepted order prevail over inconsistent website information.'] },
    { heading: '2. Pricing, tax, and payment', paragraphs: ['Prices are in the currency shown at checkout and exclude applicable taxes, duties, and delivery charges unless stated otherwise. Card payments are processed by our payment provider. Invoice purchases require approval and are due within the period stated on the invoice. Title and risk transfer as specified in the accepted order.'] },
    { heading: '3. Delivery and acceptance', paragraphs: ['Delivery estimates are good-faith projections, not guarantees. Inspect shipments promptly and report visible damage, shortages, or material nonconformity within ten business days. Custom and rack-scale systems may require site-readiness and acceptance procedures.'] },
    { heading: '4. Returns, warranty, and support', paragraphs: ['Returns require written authorization. Custom configurations and opened processors may be nonreturnable except for defects or where law requires otherwise. Hardware is covered by the warranty supplied with the accepted order; support and warranty services are separate from software licenses.'], links: [{ label: 'Warranty Services', to: '/support/warranty' }] },
    { heading: '5. Compliance and restricted use', paragraphs: ['Products may not be resold or used in violation of sanctions, export controls, or documented safety restrictions. Products are not designed for safety-critical use unless expressly validated and agreed in writing.'] },
    { heading: '6. Liability and governing terms', paragraphs: ['Nothing excludes liability that cannot lawfully be excluded. Subject to that, neither party is liable for indirect or consequential loss, and GonidonCloud’s aggregate liability is limited to the amount paid for the affected products. Governing law and venue are identified in the accepted order or master agreement.'] },
    { heading: '7. Cancellation and contact', paragraphs: ['Order changes and cancellations require our written approval and may incur costs already committed. Statutory consumer rights, where applicable, are unaffected. Contact orders@gonidoncloud.com for order assistance.'] },
  ]),
  '/legal/procurement': doc('Procurement Terms', 'Purchase-order and invoicing expectations for GonidonCloud suppliers.', [
    { heading: 'Purchase orders', paragraphs: ['Supplier agreements and written purchase orders govern procurement. Conflicting supplier terms are rejected unless expressly accepted by an authorized representative. Delivery, Incoterms, packaging, and documentation must follow the applicable order.'] },
    { heading: 'Invoices', paragraphs: ['Invoices must include the purchase-order number, supplier and buyer entities, line items, currency, taxes, bank details, and delivery evidence where required. Noncompliant invoices may be returned and payment timing adjusted without waiver of valid amounts.'] },
    { heading: 'Supplier obligations', paragraphs: ['Suppliers must comply with law, our supplier standards, information-security requirements, and responsible sourcing expectations. Gifts or payments intended to influence procurement decisions are prohibited.'] },
  ]),
  '/legal/eula': doc('Software End User License Agreement', 'License terms for downloadable GonidonCloud system software and firmware.', [
    { heading: '1. License grant', paragraphs: ['Subject to this Agreement, GonidonCloud grants a non-exclusive, non-transferable, revocable license to use provided software and firmware in object-code form with the associated GonidonCloud hardware and for internal business purposes. Open-source components remain under their own licenses.'] },
    { heading: '2. Restrictions', list: ['Do not copy, sublicense, sell, rent, or distribute the software except as expressly permitted.', 'Do not reverse engineer except where such restriction is prohibited by law.', 'Do not remove notices, bypass security, or use the software to develop a competing product through prohibited access.'] },
    { heading: '3. Updates, data, and third-party software', paragraphs: ['Updates may be required for security or compatibility. Diagnostic data handling is described in our Privacy Policy. Third-party and open-source notices are provided with the relevant distribution.'] },
    { heading: '4. Warranty, termination, and liability', paragraphs: ['Software is provided “as is” to the extent permitted by law. The license terminates upon breach. Disclaimers and liability limits in the applicable hardware or services agreement apply; mandatory statutory rights are unaffected.'] },
  ]),
  '/legal/trade-compliance': doc('Regulatory Trade Compliance', 'Export, re-export, sanctions, and product-classification information.', [
    { heading: 'Compliance commitment', paragraphs: ['GonidonCloud complies with applicable export, re-export, import, and sanctions laws. Customers must not transfer products, software, or technology to restricted parties, embargoed destinations, or prohibited end uses.'] },
    { heading: 'Classifications and orders', paragraphs: ['Product classifications, when available, are provided for convenience and may change. Customers remain responsible for their own regulatory determinations. We may screen, decline, suspend, or cancel transactions to meet compliance obligations.'] },
    { heading: 'End-use and contact', paragraphs: ['Our products may not be used in prohibited weapons, unauthorized nuclear, military-intelligence, or surveillance applications where restricted by law. Classification or compliance questions may be sent to trade@gonidoncloud.com.'] },
  ]),
  '/legal/accessibility': doc('Website Accessibility Statement', 'Our commitment to accessible digital experiences.', [
    { heading: 'Our goal', paragraphs: ['We aim to conform to WCAG 2.2 Level AA and to provide a website usable with keyboards, screen readers, zoom, reduced-motion preferences, and high-contrast settings. Accessibility is considered in design and development.'] },
    { heading: 'Ongoing work', paragraphs: ['Some older documents or third-party services may not yet meet the same standard. We review issues, prioritize accessible alternatives, and include accessibility in our release testing.'] },
    { heading: 'Feedback', paragraphs: ['If you encounter a barrier, contact accessibility@gonidoncloud.com with the page address and a description of the issue. We will provide the information or service in an accessible format where reasonable.'] },
  ]),
  '/legal/partner-standards': doc('Partner Trust & Safety Standards', 'Conduct expected from GonidonCloud partners and their representatives.', [
    { heading: 'Lawful and ethical conduct', paragraphs: ['Partners must comply with anti-bribery, competition, sanctions, privacy, security, labor, and marketing laws. No partner may offer improper benefits, misrepresent products, or make unauthorized commitments for GonidonCloud.'] },
    { heading: 'Respect and safety', paragraphs: ['Discrimination, harassment, violence, retaliation, and exploitative conduct are prohibited. Partner personnel must protect confidential and personal information and follow customer-site safety requirements.'] },
    { heading: 'Reporting and enforcement', paragraphs: ['Concerns may be reported to ethics@gonidoncloud.com. We may investigate, require corrective action, suspend benefits, or terminate relationships for material violations. Good-faith reporting will not be retaliated against.'] },
  ]),
  '/legal/product-security': doc('Product Security & Vulnerability Disclosure', 'How to report a potential GonidonCloud product or website vulnerability.', [
    { heading: 'Reporting', paragraphs: ['Send reports to security@gonidoncloud.com with affected products, versions, reproduction steps, potential impact, and your contact information. Do not include exploit details in public channels or access data that is not yours.'] },
    { heading: 'Coordinated research', paragraphs: ['Use only systems you own or are authorized to test, avoid service disruption and privacy violations, and allow reasonable time for investigation and remediation before disclosure. Good-faith research under these guidelines is welcome.'] },
    { heading: 'Our response', paragraphs: ['We aim to acknowledge reports within three business days, triage severity, coordinate mitigations, and publish customer guidance when appropriate. This policy is not a bug-bounty commitment and does not authorize unlawful testing.'] },
  ]),
  '/legal/weee': doc('WEEE & Recycling', 'Responsible handling of electrical and electronic equipment at end of life.', [
    { heading: 'Separate collection', paragraphs: ['Products bearing the crossed-out wheeled-bin symbol must not be disposed of with unsorted household waste. Separate collection and proper treatment help conserve resources and prevent environmental harm.'] },
    { heading: 'Business customers', paragraphs: ['Business customers should use authorized waste carriers and follow local WEEE, battery, packaging, data-destruction, and hazardous-material requirements. Securely erase storage devices before return or disposal.'] },
    { heading: 'Returns and information', paragraphs: ['Where take-back programs are available, contact recycling@gonidoncloud.com with product model, serial number, quantity, and location for instructions. Local arrangements may vary.'] },
  ]),
  '/legal/privacy-choices': doc('Your Privacy Choices', 'Manage marketing, optional cookies, and personal-information requests.', [
    { heading: 'Cookie and marketing preferences', paragraphs: ['Use Cookie Settings to change optional browser technologies. You may unsubscribe from marketing through the link in any marketing email; essential transaction and service messages may still be sent.'] },
    { heading: 'Access and deletion requests', paragraphs: ['To request access, correction, deletion, portability, restriction, or objection, contact privacy@gonidoncloud.com with your name, business email, request type, and relevant relationship with GonidonCloud. Do not send identity documents unless specifically requested.'] },
    { heading: 'Sale, sharing, and authorized agents', paragraphs: ['GonidonCloud does not sell personal information for money. Where applicable law provides a broader opt-out right, it may be exercised through Cookie Settings. Authorized agents must provide proof of authority, and we may verify the requester directly.'] },
    { heading: 'Response and non-discrimination', paragraphs: ['We will verify and respond within the period required by applicable law. Exercising privacy rights will not result in unlawful discrimination.'] },
  ]),
};

export const legalIndex = [
  { title: 'Website & Data', items: [
    { title: 'Privacy Policy', to: '/legal/privacy', text: 'Personal information, rights, retention, and international transfers.' },
    { title: 'Terms of Use / Copyright', to: '/legal/terms', text: 'Website access, permitted use, copyright, and disclaimers.' },
    { title: 'Cookies Policy', to: '/legal/cookies', text: 'Cookie categories, retention, third parties, and controls.' },
    { title: 'Your Privacy Choices', to: '/legal/privacy-choices', text: 'Privacy requests, marketing, and optional data sharing.' },
    { title: 'Website Accessibility', to: '/legal/accessibility', text: 'Our WCAG goals and accessibility feedback process.' },
  ] },
  { title: 'Purchasing & Products', items: [
    { title: 'Terms of Sale', to: '/legal/terms-of-sale', text: 'Orders, payment, delivery, returns, warranties, and liability.' },
    { title: 'Software EULA', to: '/legal/eula', text: 'Firmware and downloadable software license terms.' },
    { title: 'Trade Compliance', to: '/legal/trade-compliance', text: 'Exports, sanctions, classifications, and restricted end uses.' },
    { title: 'Product Security', to: '/legal/product-security', text: 'Coordinated vulnerability reporting and response.' },
    { title: 'WEEE & Recycling', to: '/legal/weee', text: 'Responsible end-of-life handling and take-back information.' },
  ] },
  { title: 'Corporate & Partners', items: [
    { title: 'Trademarks & Brand Use', to: '/legal/trademarks', text: 'Attribution and permitted use of GonidonCloud marks.' },
    { title: 'Supply Chain Transparency', to: '/legal/supply-chain', text: 'Responsible sourcing, labor standards, and due diligence.' },
    { title: 'Fair & Open Competition', to: '/legal/competition', text: 'Competition-law and unbiased procurement commitments.' },
    { title: 'Tax Strategy (UK)', to: '/legal/tax-strategy', text: 'Tax governance, planning, risk, and transparency.' },
    { title: 'Procurement Terms', to: '/legal/procurement', text: 'Supplier purchase orders, invoices, and obligations.' },
    { title: 'Partner Trust & Safety', to: '/legal/partner-standards', text: 'Ethical, safe, and lawful partner conduct.' },
  ] },
];
