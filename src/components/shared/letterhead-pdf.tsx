import { Document, Page, Text, View, StyleSheet, Font, Svg, Path, Rect, G, Polygon } from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

const colors = {
  primary: '#008751',
  primaryDark: '#005E38',
  accent: '#F59E0B',
  gold: '#FFD700',
  white: '#FFFFFF',
  darkGray: '#1E293B',
  mediumGray: '#64748B',
  border: '#E2E8F0',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: 'Inter',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingTop: 25,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderStyle: 'solid',
  },
  brandText: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.white,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 9,
    color: colors.white,
    opacity: 0.85,
    marginTop: 2,
    letterSpacing: 1,
  },
  ownerSection: {
    alignItems: 'flex-end',
  },
  ownerLabel: {
    fontSize: 8,
    color: colors.white,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.white,
    marginTop: 2,
  },
  divider: {
    height: 3,
    backgroundColor: colors.gold,
    marginTop: 10,
  },
  contactBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.primaryDark,
    gap: 20,
    marginHorizontal: -40,
    paddingHorizontal: 40,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 8,
    color: colors.white,
    fontWeight: 500,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  contentArea: {
    paddingTop: 40,
    paddingHorizontal: 50,
    paddingBottom: 90,
  },
  dateLine: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  dateLabel: {
    fontSize: 10,
    color: colors.mediumGray,
    width: 50,
  },
  dateValue: {
    fontSize: 10,
    color: colors.darkGray,
    fontWeight: 500,
  },
  toSection: {
    marginBottom: 22,
  },
  toLabel: {
    fontSize: 10,
    color: colors.mediumGray,
    marginBottom: 6,
  },
  recipientName: {
    fontSize: 11,
    color: colors.darkGray,
    fontWeight: 500,
    marginBottom: 2,
  },
  recipientAddress: {
    fontSize: 9,
    color: colors.mediumGray,
  },
  subjectSection: {
    marginBottom: 25,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subjectLabel: {
    fontSize: 10,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  subjectValue: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 600,
  },
  greeting: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 10.5,
    color: colors.darkGray,
    lineHeight: 1.7,
    marginBottom: 12,
  },
  signatureSection: {
    marginTop: 35,
  },
  closing: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.darkGray,
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 9,
    color: colors.mediumGray,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLogoSmall: {
    width: 22,
    height: 22,
    backgroundColor: colors.primaryDark,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  footerText: {
    fontSize: 8,
    color: colors.white,
    opacity: 0.9,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  footerWebsite: {
    fontSize: 9,
    color: colors.white,
    fontWeight: 600,
  },
})

// Skoolar Logo - Graduation Cap on Gamepad
const SkoolarLogo = ({ size = 32 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <G>
      {/* Gamepad Body */}
      <Rect x="10" y="55" width="80" height="35" rx="12" fill={colors.white} />
      
      {/* Gamepad Left Handle */}
      <Path d="M15 70 Q5 75 8 90 Q10 98 20 95 Q28 92 25 80" fill={colors.white} />
      
      {/* Gamepad Right Handle */}
      <Path d="M85 70 Q95 75 92 90 Q90 98 80 95 Q72 92 75 80" fill={colors.white} />
      
      {/* Gamepad Buttons Area */}
      <Rect x="42" y="62" width="16" height="10" rx="3" fill={colors.primary} />
      
      {/* Graduation Cap (Mortarboard) - Positioned above gamepad */}
      {/* Cap Base/Board */}
      <Polygon points="50,8 85,35 50,50 15,35" fill={colors.primary} />
      
      {/* Cap Base underside */}
      <Polygon points="50,50 85,35 90,38 50,52 10,38 15,35" fill={colors.primaryDark} />
      
      {/* Cap Button on top */}
      <Rect x="47" y="5" width="6" height="6" rx="3" fill={colors.gold} />
      
      {/* Tassel String */}
      <Path d="M50 35 L65 42 L68 58" fill="none" stroke={colors.gold} strokeWidth="2" strokeLinecap="round" />
      
      {/* Tassel End */}
      <Rect x="64" y="55" width="8" height="12" rx="2" fill={colors.gold} />
      
      {/* Small D-pad / cross on gamepad */}
      <Rect x="20" y="66" width="3" height="10" rx="1" fill={colors.primary} />
      <Rect x="16" y="70" width="10" height="3" rx="1" fill={colors.primary} />
      
      {/* Small ABXY buttons on gamepad */}
      <Rect x="75" y="65" width="6" height="6" rx="3" fill={colors.primary} />
      <Rect x="69" y="71" width="6" height="6" rx="3" fill={colors.primary} />
      <Rect x="81" y="71" width="6" height="6" rx="3" fill={colors.gold} />
    </G>
  </Svg>
)

// Email Icon
const EmailIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24">
    <Path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill={colors.white} />
  </Svg>
)

// Phone Icon
const PhoneIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24">
    <Path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.46 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill={colors.white} />
  </Svg>
)

// Location Icon
const LocationIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24">
    <Path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill={colors.white} />
  </Svg>
)

export function LetterheadPDF({ 
  recipientName = '', 
  recipientAddress = '',
  subject = '',
  content = '',
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}: { 
  recipientName?: string
  recipientAddress?: string
  subject?: string
  content?: string
  date?: string
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Logo and Company Name */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <SkoolarLogo size={32} />
              </View>
              <View style={styles.brandText}>
                <Text style={styles.companyName}>SKOOLAR TECHNOLOGIES LTD</Text>
                <Text style={styles.tagline}>Learn. Play. Excel.</Text>
              </View>
            </View>
            
            {/* Proprietor */}
            <View style={styles.ownerSection}>
              <Text style={styles.ownerLabel}>Proprietor</Text>
              <Text style={styles.ownerName}>Odebunmi Tawwab</Text>
            </View>
          </View>
          
          {/* Gold Divider */}
          <View style={styles.divider} />
        </View>
        
        {/* Contact Bar */}
        <View style={styles.contactBar}>
          <View style={styles.contactItem}>
            <EmailIcon />
            <Text style={styles.contactText}>contact@skoolar.org</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.contactItem}>
            <PhoneIcon />
            <Text style={styles.contactText}>+234 903 346 0322</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.contactItem}>
            <LocationIcon />
            <Text style={styles.contactText}>33 Odiolowo Street, Ijebu Ode, Ogun State</Text>
          </View>
        </View>
        
        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Date */}
          <View style={styles.dateLine}>
            <Text style={styles.dateLabel}>Date:</Text>
            <Text style={styles.dateValue}>{date}</Text>
          </View>
          
          {/* Recipient */}
          {(recipientName || recipientAddress) && (
            <View style={styles.toSection}>
              <Text style={styles.toLabel}>To:</Text>
              {recipientName && <Text style={styles.recipientName}>{recipientName}</Text>}
              {recipientAddress && <Text style={styles.recipientAddress}>{recipientAddress}</Text>}
            </View>
          )}
          
          {/* Subject */}
          <View style={styles.subjectSection}>
            <Text style={styles.subjectLabel}>Subject:</Text>
            <Text style={styles.subjectValue}>{subject || 'Official Correspondence'}</Text>
          </View>
          
          {/* Greeting */}
          <Text style={styles.greeting}>Dear Sir/Ma,</Text>
          
          {/* Content paragraphs */}
          {content ? (
            content.split('\n\n').map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>{paragraph}</Text>
            ))
          ) : (
            <>
              <Text style={styles.paragraph}>
                We are writing to you regarding the matter stated above. Please find all 
                relevant information enclosed with this letter. Should you require any further 
                clarification, please do not hesitate to contact us.
              </Text>
              <Text style={styles.paragraph}>
                We appreciate your attention to this matter and look forward to your 
                prompt response. Thank you for choosing Skoolar Technologies LTD.
              </Text>
            </>
          )}
          
          {/* Signature Section */}
          <View style={styles.signatureSection}>
            <Text style={styles.closing}>Yours faithfully,</Text>
            <View>
              <Text style={styles.signatureName}>Odebunmi Tawwab</Text>
              <Text style={styles.signatureTitle}>Proprietor, Skoolar Technologies LTD</Text>
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.footerLogoSmall}>
              <SkoolarLogo size={14} />
            </View>
            <Text style={styles.footerText}>Skoolar Technologies LTD</Text>
          </View>
          
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>120101</Text>
            <View style={styles.footerDot} />
            <Text style={styles.footerWebsite}>skoolar.org</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
