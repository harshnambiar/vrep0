
const app = document.getElementById('app')
let currentAccount = null

let currentTab = 'dashboard'

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

function renderProofs() {
  return `
    <div>
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-4xl font-semibold tracking-tighter">Proofs</h2>
          <p class="text-zinc-400">All generated verifiable proofs</p>
        </div>
        <button onclick="alert('New proof creation flow coming soon 🐐')"
                class="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors">
          New Proof
        </button>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-zinc-800">
              <th class="text-left p-6 font-medium text-zinc-400">Proof ID</th>
              <th class="text-left p-6 font-medium text-zinc-400">Type</th>
              <th class="text-left p-6 font-medium text-zinc-400">Status</th>
              <th class="text-left p-6 font-medium text-zinc-400">Generated</th>
              <th class="text-left p-6 font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            <tr class="hover:bg-zinc-800/50">
              <td class="p-6 font-mono text-sm">0x8f3a...9d2e</td>
              <td class="p-6">Price Feed</td>
              <td class="p-6"><span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Verified</span></td>
              <td class="p-6 text-zinc-400 text-sm">2 hours ago</td>
              <td class="p-6"><button class="text-indigo-400 hover:text-indigo-300">View Proof →</button></td>
            </tr>
            <tr class="hover:bg-zinc-800/50">
              <td class="p-6 font-mono text-sm">0x7b2c...4a1f</td>
              <td class="p-6">Identity Proof</td>
              <td class="p-6"><span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Verified</span></td>
              <td class="p-6 text-zinc-400 text-sm">Yesterday</td>
              <td class="p-6"><button class="text-indigo-400 hover:text-indigo-300">View Proof →</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderAccount() {
  return `
    <div>
      <h2 class="text-4xl font-semibold tracking-tighter mb-8">Data Sources</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-emerald-400 font-medium">Chainlink</div>
              <div class="text-2xl font-semibold mt-2">ETH / USD</div>
            </div>
            <span class="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">Last verified • 3 minutes ago</div>
        </div>

        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-amber-400 font-medium">API Oracle</div>
              <div class="text-2xl font-semibold mt-2">Weather Data</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">Last verified • 2 hours ago</div>
        </div>


      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-amber-400 font-medium">API Oracle</div>
              <div class="text-2xl font-semibold mt-2">Weather Data</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">Last verified • 2 hours ago</div>
        </div>


      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-amber-400 font-medium">API Oracle</div>
              <div class="text-2xl font-semibold mt-2">Weather Data</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Pending</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">Last verified • 2 hours ago</div>
        </div>


      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-amber-400 font-medium">API Oracle</div>
              <div class="text-2xl font-semibold mt-2">Weather Data</div>
            </div>
            <span class="px-4 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">Coming Soon</span>
          </div>
          <div class="mt-10 text-zinc-400 text-sm">Last verified • 2 hours ago</div>
        </div>
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
            With numerous ways to increase the account reputation, like Email and Web Proofs, donations to charitable organizations, one-time tips to the vRep Treasury, and endorsements from verified wallets, vRep ensures to provide an unadulterated picture to client projects about the authenticity and reputation of the accounts interacting with their Smart Contracts.
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
            <a href="#" onclick="switchTab('account')" class="tab-link text-zinc-400 hover:text-zinc-200" id="tab-account">Account</a>
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
    case 'account':
      html = renderAccount()
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
