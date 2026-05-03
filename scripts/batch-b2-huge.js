const expandAndAppend = require('./expand-vocab-lib');

const data = [
  ["Networking", "Connecting computer systems and devices", "Protocol|Set of rules governing data exchange|noun|PROH-tuh-kol|Network protocol.|rules|;Router|Device that forwards data packets|noun|ROW-ter|Wireless router.|forwarder|;Switch|Device that connects devices on a network|noun|swich|Ethernet switch.|connector|;Firewall|System designed to block unauthorized access|noun|FYRE-wawl|Network firewall.|security gate|;Bandwidth|Maximum rate of data transfer|noun|BAND-width|High bandwidth.|capacity|;Latency|Delay before a transfer of data begins|noun|LAY-tuhn-see|Low latency.|delay|;Packet|Basic unit of data sent over a network|noun|PAK-it|Data packet.|unit|;Topoloy|Arrangement of network elements|noun|tuh-POL-uh-jee|Network topology.|layout|;Infrastructure|Fundamental physical structures|noun|IN-fruh-struk-cher|Network infrastructure.|base|;Subnet|Logical subdivision of an IP network|noun|SUB-net|Create a subnet.|division|;Gateway|Node that acts as an entrance to another network|noun|GAYT-way|Network gateway.|entrance|;DNS|Domain Name System|noun|dee en es|DNS server.|name system|;IP Address|Unique string of numbers identifying a device|noun|eye pee uh-DRES|Static IP address.|identity|;Ethernet|System for connecting a number of computers|noun|EE-ther-net|Ethernet cable.|wired network|;Wi-Fi|Facility allowing computers to connect wirelessly|noun|WY-fy|Wireless Wi-Fi.|wireless|"],
  ["Environmental Law", "Legal frameworks for protecting nature", "Regulation|Rule maintained by an authority|noun|reg-yuh-LAY-shun|Environmental regulation.|rule|;Compliance|Action of complying with a command|noun|kuhm-PLY-uhns|Legal compliance.|obedience|;Liability|State of being responsible by law|noun|ly-uh-BIL-i-tee|Environmental liability.|responsibility|;Statute|Written law passed by a legislative body|noun|STAT-yoot|Federal statute.|law|;Treaty|Formally concluded agreement between countries|noun|TREE-tee|International treaty.|agreement|;Litigation|Process of taking legal action|noun|lit-i-GAY-shuhn|Environmental litigation.|lawsuit|;Sustainability|Responsibility for environmental impact|noun|suh-stay-nuh-BIL-i-tee|Principles of sustainability.|viability|;Impact|Effect or influence of one thing on another|noun|IM-pakt|Environmental impact.|effect|;Conservation|Protecting natural resources|noun|kon-ser-VAY-shun|Wildlife conservation.|protection|;Pollution|Presence of harmful substances|noun|puh-LOO-shun|Water pollution.|contamination|;Mandate|Official order to do something|noun|MAN-dayt|Federal mandate.|order|;Governance|Action of governing|noun|GUV-er-nuhns|Environmental governance.|ruling|;Ethics|Moral principles|noun|ETH-iks|Environmental ethics.|morality|;Policy|Course of action adopted|noun|POL-uh-see|Climate policy.|strategy|;Justice|Fair treatment|noun|JUS-tis|Environmental justice.|fairness|"]
];

data.forEach(d => {
  try {
    expandAndAppend({
      level: 'B2',
      title: d[0],
      description: d[1],
      difficulty: 'INTERMEDIATE',
      words: d[2]
    });
  } catch (e) {
    console.error(`Error in ${d[0]}:`, e.message);
  }
});
