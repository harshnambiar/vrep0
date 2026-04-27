import './style.css';
import { createVlayerClient, createExtensionWebProofProvider } from '@vlayer/sdk'
import { Vouch } from '@getvouch/sdk';


const app = document.getElementById('app')
let currentAccount = null

let currentTab = 'dashboard'

let emailVerified = true;
let linkedinVerified = false;
let donationVerified = false;
let tipVerified = true;
let endorseVerified = false;

// ====================== HELPERS ======================
function shortenAddress(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
}

// Optimism Sepolia network switch
async function switchToOptimismSepolia() {
  if (!window.ethereum) return false

  const optimismSepolia = {
    chainId: '0xaa37dc',
    chainName: 'Optimism Sepolia',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimistic.etherscan.io']
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: optimismSepolia.chainId }]
    })
    return true
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [optimismSepolia]
        })
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: optimismSepolia.chainId }]
        })
        return true
      } catch {
        alert("Failed to add Optimism Sepolia network.")
        return false
      }
    }
    return false
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask!")
    return
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    currentAccount = accounts[0]
    const switched = await switchToOptimismSepolia()
    if (switched) renderUI()
  } catch (error) {
    if (error.code !== 4001) alert("Failed to connect wallet.")
  }
}

function disconnectWallet() {
  currentAccount = null
  renderUI()
}

// ====================== VERIFICATION FUNCTIONS =====================
async function verifyLinkedin() {
  const webProofProvider = createExtensionWebProofProvider();

  const vlayer = createVlayerClient({
    webProofProvider: webProofProvider,
  });

  const cid = import.meta.env.VITE_VL_CUSTOMER_ID;
  const apiKey = import.meta.env.VITE_VL_API_KEY;
  const dataSource = import.meta.env.VITE_LINKEDIN_DATA_SOURCE_ID;

  // Create Vouch instance just for reference (optional)
  const vouch = new Vouch({
    customerId: cid,
    apiKey: apiKey,
  });
  console.log('Vouch instance created:', vouch);

  try {
    // Manually call the endpoint through the proxy
    const creds = btoa(`${apiKey}:`);
    const response = await fetch('/api/vouch/api/proof-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cid,
        'Authorization': `Bearer ${creds}`,   // or however the SDK sends it (try 'Basic' if needed)
      },
      body: JSON.stringify({
        datasourceId: dataSource,
        customerId: cid,
        inputs: "{}",
        redirectBackUrl: "http://localhost:5173",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vouch API error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const { verificationUrl, requestId } = data;

    console.log("Verification URL:", verificationUrl);
    console.log("Request ID:", requestId);

    if (verificationUrl) {
      window.location.href = verificationUrl;
    } else {
      console.error("No verificationUrl in response");
    }
  } catch (error) {
    console.log(error);
    console.error("Error calling Vouch API:", error);
    alert("Failed to start LinkedIn verification. Check console for details.");
  }
}

window.verifyLinkedin = verifyLinkedin;

// ====================== PAGE RENDER FUNCTIONS ======================

function renderDashboard() {
  const isConnected = !!currentAccount
  return `
    <div>
      <div class="mb-12">
        <h1 class="text-5xl font-semibold tracking-tighter">vRep</h1>
        <p class="text-zinc-400 mt-3 text-lg">
          ${isConnected
            ? 'Your reputation verifiable layer is active on Optimism Sepolia.'
            : 'Connect your wallet to get started.'}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-indigo-500/40 transition-all">
          <div class="text-zinc-400 text-sm font-medium">ACTIVE PROOFS</div>
          <div class="text-6xl font-semibold tracking-tighter mt-4">142</div>
          <div class="text-emerald-400 text-sm mt-2">↑ 23 today</div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-indigo-500/40 transition-all">
          <div class="text-zinc-400 text-sm font-medium">VERIFIED SOURCES</div>
          <div class="text-6xl font-semibold tracking-tighter mt-4">27</div>
          <div class="text-emerald-400 text-sm mt-2">3 this week</div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-indigo-500/40 transition-all">
          <div class="text-zinc-400 text-sm font-medium">ZK PROOFS GENERATED</div>
          <div class="text-6xl font-semibold tracking-tighter mt-4">8.4k</div>
          <div class="text-emerald-400 text-sm mt-2">this month</div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">
        <h2 class="text-xl font-semibold mb-6">Recent Activity</h2>
        <p class="text-zinc-400">${isConnected ? 'Live proof feed coming soon.' : 'Connect wallet to see activity.'}</p>
      </div>
    </div>
  `
}

function renderFaq() {
  return `
    <div>
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-4xl font-semibold tracking-tighter">FAQ</h2>
          <p class="text-zinc-400">All you need to know about vRep</p>
        </div>

      </div>
      <div class="space-y-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div>
          <p style="color: #50c888;font-size: 1.4em;">What does vRep do?</p>
           <p> vRep is a Reputation Verifier as a Service (RVaaS). It prompts users to preemptively have their proof of humanity (PoH) verifications done once, so that any subsequent project can simply access those results via zero-knowledge proof mechanisms, instead of making them verify it every time. With many methods of verification, such as Vlayer standard Email and Web Proofs, and more community centric methods like Charitable Donations and Endorsements from Trusted Accounts, vRep seeks to combine security and trust with a community and social responsibilty angle, aiming to bring the entire ecosystem together.</p>
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div>
          <p style="color: #50c888;font-size: 1.4em;">Is vRep safe?</p>
            <p>vRep is incredibly safe and only uses zk Proofs, facilitated by the Vlayer protocol to deliver your Verification Status to client projects. We also don't store your data on any database or in any offline form.</p>
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div>
          <p style="color: #50c888;font-size: 1.4em;">How much does it cost to use vRep?</p>
            <p>vRep is free to use for the community. Some methods of verification like Charitable Donations and Tipping require monetary transactions, but it is up to you which methods you want to be verified with. Please note that projects using vRep decide which methods of verification they want to prioritise and vRep simply provides a zk Proof for each of those methods to them. We don't ask or not ask end users to use a particular method of verification.</p>
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div>
          <p style="color: #50c888;font-size: 1.4em;">I am a developer. How do I use the vRep proofs in my code?</p>
            <p>You just need to use our Solidity library in your Smart Contract. The detailed documentation can be found here.</p>
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div>
          <p style="color: #50c888;font-size: 1.4em;">Which chains does vRep support?</p>
            <p>Currently, we are in the beta phase and only support the Optimism Sepolia Testnet. Following our mainnet launch, we will also add other EVM chains like Ethereum, Base, Arbitrum, and Sei in the near future.</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderProofs() {

  return `
    <div>
      <h2 class="text-4xl font-semibold tracking-tighter mb-8">Account Status</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>

            ${emailVerified ? `<div class="text-emerald-400 font-medium">Email Proof</div>
              <div class="text-2xl font-semibold mt-2">Email Proofs by Vlayer</div>
            </div>
            <span class="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Verified</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">No further action required</div>`
              : `<div class="text-amber-400 font-medium">Email Proof</div>
              <div class="text-2xl font-semibold mt-2">Email Proofs by Vlayer</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm" onclick="coming()" style="cursor: pointer;">Get Verified Now</div>`
            }

        </div>

        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>

            ${linkedinVerified ? `<div class="text-emerald-400 font-medium">LinkedIn Proof</div>
              <div class="text-2xl font-semibold mt-2">LinkedId Proof by Vlayer</div>
            </div>
            <span class="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Verified</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">No further action required</div>`
              : `<div class="text-amber-400 font-medium">LinkedIn Proof</div>
              <div class="text-2xl font-semibold mt-2">LinkedIn Proof by Vlayer</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm" onclick="verifyLinkedin()" style="cursor: pointer;">Get Verified Now</div>`
            }
        </div>


      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
              ${endorseVerified ? `<div class="text-emerald-400 font-medium">Endorsed</div>
              <div class="text-2xl font-semibold mt-2">Get Endorsed by Trusted Accounts</div>
            </div>
            <span class="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Verified</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">No further action required</div>`
              : `<div class="text-amber-400 font-medium">Endorsed</div>
              <div class="text-2xl font-semibold mt-2">Get Endorsed by Trusted Accounts</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm" onclick="coming()" style="cursor: pointer;">Get Verified Now</div>`
            }
        </div>


      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
               ${tipVerified ? `<div class="text-emerald-400 font-medium">One-Time Tip</div>
              <div class="text-2xl font-semibold mt-2">Make a One-Time Tip to vRep</div>
            </div>
            <span class="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Verified</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">No further action required</div>`
              : `<div class="text-amber-400 font-medium">One-Time Tip</div>
              <div class="text-2xl font-semibold mt-2">Make a One-Time Tip to vRep</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm" onclick="coming()" style="cursor: pointer;">Get Verified Now</div>`
            }
        </div>


      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
               ${donationVerified ? `<div class="text-emerald-400 font-medium">Charitable Donations</div>
              <div class="text-2xl font-semibold mt-2">Donate to Charities that Matter</div>
            </div>
            <span class="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Verified</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">No further action required</div>`
              : `<div class="text-amber-400 font-medium">Charitable Donations</div>
              <div class="text-2xl font-semibold mt-2">Donate to Charities that Matter</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Coming Soon</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm" onclick="coming()" style="cursor: pointer;">Stay Tuned</div>`
            }
      </div>


    </div>
  `
}

function renderAbout() {
  return `
    <div>
      <h2 class="text-4xl font-semibold tracking-tighter mb-8">About vRep</h2>

      <div class="space-y-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div class="w-2 h-2 mt-2.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          <div>
            vRep is a zero-knowledge (zk) Reputation Verification Layer, built on the Vlayer Protocol
          </div>
        </div>
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div class="w-2 h-2 mt-2.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          <div>
            With numerous ways to increase the account reputation, like Email and LinkedIn Proofs, donations to charitable organizations, one-time tips to the vRep Treasury, and endorsements from verified wallets, vRep ensures to provide an unadulterated picture to client projects about the authenticity and reputation of the accounts interacting with their Smart Contracts.
          </div>
        </div>

        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex gap-6">
          <div class="w-2 h-2 mt-2.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
          <div>
            vRep functions can directly be called from Client Smart Contracts, and they integrate seamlessly with your code. Currently on the Optimism Sepolia Testnet, try it <a style="cursor:pointer;" onclick="switchTab('proofs')">NOW</a>.
          </div>
        </div>

      </div>
    </div>
  `
}

// ====================== MAIN RENDER ======================
function renderUI() {
  const isConnected = !!currentAccount

  app.innerHTML = `
    <div class="min-h-screen bg-zinc-950 text-zinc-100">

      <!-- Navbar -->
      <nav class="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-inner">V</div>
            <div>
              <span class="font-semibold tracking-tighter text-3xl">vrep</span>
              <span class="text-xs text-zinc-500 ml-1.5 align-super">vlayer</span>
            </div>
          </div>

          <div class="flex items-center gap-8 text-sm font-medium">
            <a href="#" onclick="switchTab('dashboard')" class="tab-link text-white" id="tab-dashboard">Dashboard</a>
            <a href="#" onclick="switchTab('proofs')" class="tab-link text-zinc-400 hover:text-zinc-200" id="tab-proofs">Proofs</a>
            <a href="#" onclick="switchTab('faq')" class="tab-link text-zinc-400 hover:text-zinc-200" id="tab-account">FAQ</a>
            <a href="#" onclick="switchTab('about')" class="tab-link text-zinc-400 hover:text-zinc-200" id="tab-about">About</a>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-3xl text-sm">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span class="text-emerald-400 font-medium">Optimism Sepolia</span>
            </div>

            ${isConnected
              ? `<button onclick="disconnectWallet()" class="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 px-5 py-2.5 rounded-3xl text-sm font-medium transition-all">
                   <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <span class="font-mono">${shortenAddress(currentAccount)}</span>
                 </button>`
              : `<button onclick="connectWallet()" class="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-2.5 rounded-3xl font-semibold text-sm transition-all">
                   <img src="https://cdn.iconscout.com/icon/free/png-256/free-metamask-logo-icon-svg-download-png-2261817.png?f=webp&amp;w=256" alt="MetaMask" class="w-5 h-5">
                   Connect MetaMask
                 </button>`
            }
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="max-w-7xl mx-auto px-6 py-10" id="main-content">
        <!-- Content injected by switchTab -->
      </div>
    </div>
  `

  // Load default dashboard
  switchTab(currentTab)
}

// ====================== TAB SWITCHING ======================
window.switchTab = function(tab) {
  const contentArea = document.getElementById('main-content')
  currentTab = tab

  let html = ''
  switch(tab) {
    case 'dashboard':
      html = renderDashboard()
      break
    case 'proofs':
      html = renderProofs()
      break
    case 'faq':
      html = renderFaq()
      break
    case 'about':
      html = renderAbout()
      break
    default:
      html = renderDashboard()
  }

  contentArea.innerHTML = html

  // Update active tab styles
  document.querySelectorAll('.tab-link').forEach(link => {
    if (link.id === `tab-${tab}`) {
      link.classList.add('text-white')
      link.classList.remove('text-zinc-400')
    } else {
      link.classList.remove('text-white')
      link.classList.add('text-zinc-400')
    }
  })
}

// Make wallet functions global
window.connectWallet = connectWallet
window.disconnectWallet = disconnectWallet

// Initialize
renderUI()

// MetaMask event listeners
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    currentAccount = accounts[0] || null
    renderUI()
  })

  window.ethereum.on('chainChanged', () => renderUI())
}
