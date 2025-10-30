import { SecurityToolsCollectionSchema, type SecurityToolsCollection } from '../shared/types.js';

const collectionData = {
  version: '1.0',
  last_updated: '2025-10-30',
  categories: [
    {
      name: 'Network Reconnaissance & Scanning',
      tool_count: 25,
      tools: [
        { name: 'Nmap', description: 'Advanced port scanning with custom NSE scripts and service detection' },
        { name: 'Rustscan', description: 'Ultra-fast port scanner with intelligent rate limiting' },
        { name: 'Masscan', description: 'High-speed Internet-scale port scanning with banner grabbing' },
        { name: 'AutoRecon', description: 'Comprehensive automated reconnaissance with 35+ parameters' },
        { name: 'Amass', description: 'Advanced subdomain enumeration and OSINT gathering' },
        { name: 'Subfinder', description: 'Fast passive subdomain discovery with multiple sources' },
        { name: 'Fierce', description: 'DNS reconnaissance and zone transfer testing' },
        { name: 'DNSEnum', description: 'DNS information gathering and subdomain brute forcing' },
        { name: 'TheHarvester', description: 'Email and subdomain harvesting from multiple sources' },
        { name: 'ARP-Scan', description: 'Network discovery using ARP requests' },
        { name: 'NBTScan', description: 'NetBIOS name scanning and enumeration' },
        { name: 'RPCClient', description: 'RPC enumeration and null session testing' },
        { name: 'Enum4linux', description: 'SMB enumeration with user, group, and share discovery' },
        { name: 'Enum4linux-ng', description: 'Advanced SMB enumeration with enhanced logging' },
        { name: 'SMBMap', description: 'SMB share enumeration and exploitation' },
        { name: 'Responder', description: 'LLMNR, NBT-NS and MDNS poisoner for credential harvesting' },
        { name: 'NetExec', description: 'Network service exploitation framework (formerly CrackMapExec)' }
      ]
    },
    {
      name: 'Web Application Security Testing',
      tool_count: 40,
      tools: [
        { name: 'Gobuster', description: 'Directory, file, and DNS enumeration with intelligent wordlists' },
        { name: 'Dirsearch', description: 'Advanced directory and file discovery with enhanced logging' },
        { name: 'Feroxbuster', description: 'Recursive content discovery with intelligent filtering' },
        { name: 'FFuf', description: 'Fast web fuzzer with advanced filtering and parameter discovery' },
        { name: 'Dirb', description: 'Comprehensive web content scanner with recursive scanning' },
        { name: 'HTTPx', description: 'Fast HTTP probing and technology detection' },
        { name: 'Katana', description: 'Next-generation crawling and spidering with JavaScript support' },
        { name: 'Hakrawler', description: 'Fast web endpoint discovery and crawling' },
        { name: 'Gau', description: 'Get All URLs from multiple sources (Wayback, Common Crawl, etc.)' },
        { name: 'Waybackurls', description: 'Historical URL discovery from Wayback Machine' },
        { name: 'Nuclei', description: 'Fast vulnerability scanner with 4000+ templates' },
        { name: 'Nikto', description: 'Web server vulnerability scanner with comprehensive checks' },
        { name: 'SQLMap', description: 'Advanced automatic SQL injection testing with tamper scripts' },
        { name: 'WPScan', description: 'WordPress security scanner with vulnerability database' },
        { name: 'Arjun', description: 'HTTP parameter discovery with intelligent fuzzing' },
        { name: 'ParamSpider', description: 'Parameter mining from web archives' },
        { name: 'X8', description: 'Hidden parameter discovery with advanced techniques' },
        { name: 'Jaeles', description: 'Advanced vulnerability scanning with custom signatures' },
        { name: 'Dalfox', description: 'Advanced XSS vulnerability scanning with DOM analysis' },
        { name: 'Wafw00f', description: 'Web application firewall fingerprinting' },
        { name: 'TestSSL', description: 'SSL/TLS configuration testing and vulnerability assessment' },
        { name: 'SSLScan', description: 'SSL/TLS cipher suite enumeration' },
        { name: 'SSLyze', description: 'Fast and comprehensive SSL/TLS configuration analyzer' },
        { name: 'Anew', description: 'Append new lines to files for efficient data processing' },
        { name: 'QSReplace', description: 'Query string parameter replacement for systematic testing' },
        { name: 'Uro', description: 'URL filtering and deduplication for efficient testing' },
        { name: 'Whatweb', description: 'Web technology identification with fingerprinting' },
        { name: 'JWT-Tool', description: 'JSON Web Token testing with algorithm confusion' },
        { name: 'GraphQL-Voyager', description: 'GraphQL schema exploration and introspection testing' },
        { name: 'Burp Suite Extensions', description: 'Custom extensions for advanced web testing' },
        { name: 'ZAP Proxy', description: 'OWASP ZAP integration for automated security scanning' },
        { name: 'Wfuzz', description: 'Web application fuzzer with advanced payload generation' },
        { name: 'Commix', description: 'Command injection exploitation tool with automated detection' },
        { name: 'NoSQLMap', description: 'NoSQL injection testing for MongoDB, CouchDB, etc.' },
        { name: 'Tplmap', description: 'Server-side template injection exploitation tool' }
      ]
    },
    {
      name: 'Advanced Browser Agent',
      tool_count: 10,
      tools: [
        { name: 'Headless Chrome Automation', description: 'Full Chrome browser automation with Selenium' },
        { name: 'Screenshot Capture', description: 'Automated screenshot generation for visual inspection' },
        { name: 'DOM Analysis', description: 'Deep DOM tree analysis and JavaScript execution monitoring' },
        { name: 'Network Traffic Monitoring', description: 'Real-time network request/response logging' },
        { name: 'Security Header Analysis', description: 'Comprehensive security header validation' },
        { name: 'Form Detection & Analysis', description: 'Automatic form discovery and input field analysis' },
        { name: 'JavaScript Execution', description: 'Dynamic content analysis with full JavaScript support' },
        { name: 'Proxy Integration', description: 'Seamless integration with Burp Suite and other proxies' },
        { name: 'Multi-page Crawling', description: 'Intelligent web application spidering and mapping' },
        { name: 'Performance Metrics', description: 'Page load times, resource usage, and optimization insights' }
      ]
    },
    {
      name: 'Authentication & Password Security',
      tool_count: 12,
      tools: [
        { name: 'Hydra', description: 'Network login cracker supporting 50+ protocols' },
        { name: 'John the Ripper', description: 'Advanced password hash cracking with custom rules' },
        { name: 'Hashcat', description: 'World\'s fastest password recovery tool with GPU acceleration' },
        { name: 'Medusa', description: 'Speedy, parallel, modular login brute-forcer' },
        { name: 'Patator', description: 'Multi-purpose brute-forcer with advanced modules' },
        { name: 'NetExec', description: 'Swiss army knife for pentesting networks' },
        { name: 'SMBMap', description: 'SMB share enumeration and exploitation tool' },
        { name: 'Evil-WinRM', description: 'Windows Remote Management shell with PowerShell integration' },
        { name: 'Hash-Identifier', description: 'Hash type identification tool' },
        { name: 'HashID', description: 'Advanced hash algorithm identifier with confidence scoring' },
        { name: 'CrackStation', description: 'Online hash lookup integration' },
        { name: 'Ophcrack', description: 'Windows password cracker using rainbow tables' }
      ]
    },
    {
      name: 'Binary Analysis & Reverse Engineering',
      tool_count: 25,
      tools: [
        { name: 'GDB', description: 'GNU Debugger with Python scripting and exploit development support' },
        { name: 'GDB-PEDA', description: 'Python Exploit Development Assistance for GDB' },
        { name: 'GDB-GEF', description: 'GDB Enhanced Features for exploit development' },
        { name: 'Radare2', description: 'Advanced reverse engineering framework with comprehensive analysis' },
        { name: 'Ghidra', description: 'NSA\'s software reverse engineering suite with headless analysis' },
        { name: 'IDA Free', description: 'Interactive disassembler with advanced analysis capabilities' },
        { name: 'Binary Ninja', description: 'Commercial reverse engineering platform' },
        { name: 'Binwalk', description: 'Firmware analysis and extraction tool with recursive extraction' },
        { name: 'ROPgadget', description: 'ROP/JOP gadget finder with advanced search capabilities' },
        { name: 'Ropper', description: 'ROP gadget finder and exploit development tool' },
        { name: 'One-Gadget', description: 'Find one-shot RCE gadgets in libc' },
        { name: 'Checksec', description: 'Binary security property checker with comprehensive analysis' },
        { name: 'Strings', description: 'Extract printable strings from binaries with filtering' },
        { name: 'Objdump', description: 'Display object file information with Intel syntax' },
        { name: 'Readelf', description: 'ELF file analyzer with detailed header information' },
        { name: 'XXD', description: 'Hex dump utility with advanced formatting' },
        { name: 'Hexdump', description: 'Hex viewer and editor with customizable output' },
        { name: 'Pwntools', description: 'CTF framework and exploit development library' },
        { name: 'Angr', description: 'Binary analysis platform with symbolic execution' },
        { name: 'Libc-Database', description: 'Libc identification and offset lookup tool' },
        { name: 'Pwninit', description: 'Automate binary exploitation setup' },
        { name: 'Volatility', description: 'Advanced memory forensics framework' },
        { name: 'MSFVenom', description: 'Metasploit payload generator with advanced encoding' },
        { name: 'UPX', description: 'Executable packer/unpacker for binary analysis' }
      ]
    },
    {
      name: 'Cloud & Container Security',
      tool_count: 20,
      tools: [
        { name: 'Prowler', description: 'AWS/Azure/GCP security assessment with compliance checks' },
        { name: 'Scout Suite', description: 'Multi-cloud security auditing for AWS, Azure, GCP, Alibaba Cloud' },
        { name: 'CloudMapper', description: 'AWS network visualization and security analysis' },
        { name: 'Pacu', description: 'AWS exploitation framework with comprehensive modules' },
        { name: 'Trivy', description: 'Comprehensive vulnerability scanner for containers and IaC' },
        { name: 'Clair', description: 'Container vulnerability analysis with detailed CVE reporting' },
        { name: 'Kube-Hunter', description: 'Kubernetes penetration testing with active/passive modes' },
        { name: 'Kube-Bench', description: 'CIS Kubernetes benchmark checker with remediation' },
        { name: 'Docker Bench Security', description: 'Docker security assessment following CIS benchmarks' },
        { name: 'Falco', description: 'Runtime security monitoring for containers and Kubernetes' },
        { name: 'Checkov', description: 'Infrastructure as code security scanning' },
        { name: 'Terrascan', description: 'Infrastructure security scanner with policy-as-code' },
        { name: 'CloudSploit', description: 'Cloud security scanning and monitoring' },
        { name: 'AWS CLI', description: 'Amazon Web Services command line with security operations' },
        { name: 'Azure CLI', description: 'Microsoft Azure command line with security assessment' },
        { name: 'GCloud', description: 'Google Cloud Platform command line with security tools' },
        { name: 'Kubectl', description: 'Kubernetes command line with security context analysis' },
        { name: 'Helm', description: 'Kubernetes package manager with security scanning' },
        { name: 'Istio', description: 'Service mesh security analysis and configuration assessment' },
        { name: 'OPA', description: 'Policy engine for cloud-native security and compliance' }
      ]
    },
    {
      name: 'CTF & Forensics Tools',
      tool_count: 20,
      tools: [
        { name: 'Volatility', description: 'Advanced memory forensics framework with comprehensive plugins' },
        { name: 'Volatility3', description: 'Next-generation memory forensics with enhanced analysis' },
        { name: 'Foremost', description: 'File carving and data recovery with signature-based detection' },
        { name: 'PhotoRec', description: 'File recovery software with advanced carving capabilities' },
        { name: 'TestDisk', description: 'Disk partition recovery and repair tool' },
        { name: 'Steghide', description: 'Steganography detection and extraction with password support' },
        { name: 'Stegsolve', description: 'Steganography analysis tool with visual inspection' },
        { name: 'Zsteg', description: 'PNG/BMP steganography detection tool' },
        { name: 'Outguess', description: 'Universal steganographic tool for JPEG images' },
        { name: 'ExifTool', description: 'Metadata reader/writer for various file formats' },
        { name: 'Binwalk', description: 'Firmware analysis and reverse engineering with extraction' },
        { name: 'Scalpel', description: 'File carving tool with configurable headers and footers' },
        { name: 'Bulk Extractor', description: 'Digital forensics tool for extracting features' },
        { name: 'Autopsy', description: 'Digital forensics platform with timeline analysis' },
        { name: 'Sleuth Kit', description: 'Collection of command-line digital forensics tools' },
        { name: 'John the Ripper', description: 'Password cracker with custom rules and advanced modes' },
        { name: 'Hashcat', description: 'GPU-accelerated password recovery with 300+ hash types' },
        { name: 'Hash-Identifier', description: 'Hash type identification with confidence scoring' },
        { name: 'CyberChef', description: 'Web-based analysis toolkit for encoding and encryption' },
        { name: 'Cipher-Identifier', description: 'Automatic cipher type detection and analysis' }
      ]
    },
    {
      name: 'Cryptography & Hash Analysis',
      tool_count: 6,
      tools: [
        { name: 'Frequency-Analysis', description: 'Statistical cryptanalysis for substitution ciphers' },
        { name: 'RSATool', description: 'RSA key analysis and common attack implementations' },
        { name: 'FactorDB', description: 'Integer factorization database for cryptographic challenges' },
        { name: 'John the Ripper', description: 'Password cracker with custom rules and advanced modes' },
        { name: 'Hashcat', description: 'GPU-accelerated password recovery with 300+ hash types' },
        { name: 'CyberChef', description: 'Web-based analysis toolkit for encoding and encryption' }
      ]
    },
    {
      name: 'Bug Bounty & OSINT Arsenal',
      tool_count: 20,
      tools: [
        { name: 'Amass', description: 'Advanced subdomain enumeration and OSINT gathering' },
        { name: 'Subfinder', description: 'Fast passive subdomain discovery with API integration' },
        { name: 'Hakrawler', description: 'Fast web endpoint discovery and crawling' },
        { name: 'HTTPx', description: 'Fast and multi-purpose HTTP toolkit with technology detection' },
        { name: 'ParamSpider', description: 'Mining parameters from web archives' },
        { name: 'Aquatone', description: 'Visual inspection of websites across hosts' },
        { name: 'Subjack', description: 'Subdomain takeover vulnerability checker' },
        { name: 'DNSEnum', description: 'DNS enumeration script with zone transfer capabilities' },
        { name: 'Fierce', description: 'Domain scanner for locating targets with DNS analysis' },
        { name: 'TheHarvester', description: 'Email and subdomain harvesting from multiple sources' },
        { name: 'Sherlock', description: 'Username investigation across 400+ social networks' },
        { name: 'Social-Analyzer', description: 'Social media analysis and OSINT gathering' },
        { name: 'Recon-ng', description: 'Web reconnaissance framework with modular architecture' },
        { name: 'Maltego', description: 'Link analysis and data mining for OSINT investigations' },
        { name: 'SpiderFoot', description: 'OSINT automation with 200+ modules' },
        { name: 'Shodan', description: 'Internet-connected device search with advanced filtering' },
        { name: 'Censys', description: 'Internet asset discovery with certificate analysis' },
        { name: 'Have I Been Pwned', description: 'Breach data analysis and credential exposure' },
        { name: 'Pipl', description: 'People search engine integration for identity investigation' },
        { name: 'TruffleHog', description: 'Git repository secret scanning with entropy analysis' }
      ]
    }
  ],
  new_features: [
    { name: 'Streamlined Installation Process', description: 'One-command setup with automated dependency management' },
    { name: 'Docker Container Support', description: 'Containerized deployment for consistent environments' }
  ],
  statistics: {
    total_categories: 9,
    total_tools: 188,
    last_verified: '2025-10-30'
  }
} as const;

export const securityToolsCollection: SecurityToolsCollection = SecurityToolsCollectionSchema.parse(collectionData);
