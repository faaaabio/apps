// Constantes globais
const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136d6bf9b9e-3742-4765-81a1-afdcb670f0805204000053039865802BR5919Fabio da Silva Lino6009SAO PAULO62140510iRzd4FqHdJ6304D3F4";
const WHATSAPP_NUMBER = "5511977777030";

// Preços dos pacotes
const STREAMING_PACKAGES = {
    'netflix': { price: 14.98, name: 'Netflix (4 telas)' },
    'youtube': { price: 12.90, name: 'YouTube Premium (4 telas)' },
    'globoplay': { price: 12.90, name: 'Globoplay (4 telas)' },
    'disney': { price: 15.73, name: 'Disney+ (4 telas)' },
    'hbo': { price: 13.98, name: 'Max (3 telas)' },
    'prime': { price: 7.48, name: 'Prime Video (3 telas)' },
    'star': { price: 45.90, name: 'Star+ (4 telas)' },
    'paramount': { price: 29.90, name: 'Paramount+ (3 telas)' }
};

const VPS_PACKAGES = {
    'vps-basico': { price: 24.90, name: 'Básico (1TB)' },
    'vps-premium': { price: 49.80, name: 'Premium (2TB)' },
    'vps-empresarial': { price: 124.50, name: 'Empresarial (5TB)' }
};

// Função de utilidade para formatar moeda
function formatCurrency(value) {
    return `R$ ${value.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    // Estado inicial
    let selectedStreamings = new Set();
    let selectedVPS = null;

    // Elementos do DOM
    const elements = {
        selectedStreamings: document.getElementById('selected-streamings'),
        streamingList: document.getElementById('streaming-list'),
        selectedVPS: document.getElementById('selected-vps'),
        vpsName: document.getElementById('vps-name'),
        vpsPrice: document.getElementById('vps-price'),
        totalValue: document.getElementById('total-value'),
        paymentPopup: document.getElementById('paymentPopup'),
        nameInput: document.getElementById('name')
    };

    // Funções de utilidade
    function updateSelectedItems() {
        // Atualiza Streamings
        if (elements.streamingList) {
            elements.streamingList.innerHTML = '';
            if (selectedStreamings.size > 0) {
                elements.selectedStreamings.classList.remove('hidden');
                selectedStreamings.forEach(streamingId => {
                    const streaming = STREAMING_PACKAGES[streamingId];
                    const item = document.createElement('div');
                    item.className = 'flex justify-between text-gray-500 mb-2';
                    item.innerHTML = `
                        <span>${streaming.name}</span>
                        <span>${formatCurrency(streaming.price)}</span>
                    `;
                    elements.streamingList.appendChild(item);
                });
            } else {
                elements.selectedStreamings.classList.add('hidden');
            }
        }

        // Atualiza VPS
        if (elements.selectedVPS && elements.vpsName && elements.vpsPrice) {
            if (selectedVPS) {
                elements.selectedVPS.classList.remove('hidden');
                elements.vpsName.textContent = selectedVPS.name;
                elements.vpsPrice.textContent = formatCurrency(selectedVPS.price);
            } else {
                elements.selectedVPS.classList.add('hidden');
            }
        }

        updateSummary();
    }

    function updateSummary() {
        let streamingTotal = 0;
        selectedStreamings.forEach(streamingId => {
            streamingTotal += STREAMING_PACKAGES[streamingId].price;
        });
        let vpsTotal = selectedVPS ? selectedVPS.price : 0;

        const total = streamingTotal + vpsTotal;
        if (elements.totalValue) {
            elements.totalValue.textContent = formatCurrency(total);
        }

        // Salva os dados no localStorage
        localStorage.setItem('total', formatCurrency(total));
        localStorage.setItem('selectedStreamings', JSON.stringify(Array.from(selectedStreamings)));
        localStorage.setItem('selectedVPS', selectedVPS ? selectedVPS.name : '');
        localStorage.setItem('streamingTotal', formatCurrency(streamingTotal));
        localStorage.setItem('vpsPrice', selectedVPS ? formatCurrency(selectedVPS.price) : 'R$ 0,00');
    }

    // Event Listeners para pacotes de streaming
    document.querySelectorAll('.streaming-package').forEach(package => {
        package.addEventListener('click', () => {
            const packageId = package.id;
            if (selectedStreamings.has(packageId)) {
                selectedStreamings.delete(packageId);
                package.classList.remove('selected');
            } else {
                selectedStreamings.add(packageId);
                package.classList.add('selected');
            }
            updateSelectedItems();
        });
    });

    // Event Listeners para pacotes de VPS
    document.querySelectorAll('.vps-package').forEach(package => {
        package.addEventListener('click', () => {
            const packageId = package.id;
            if (selectedVPS && selectedVPS.name === VPS_PACKAGES[packageId].name) {
                selectedVPS = null;
                package.classList.remove('selected');
            } else {
                document.querySelectorAll('.vps-package').forEach(p => p.classList.remove('selected'));
                selectedVPS = VPS_PACKAGES[packageId];
                package.classList.add('selected');
            }
            updateSelectedItems();
        });
    });

    // Inicialização
    updateSelectedItems();
});

// Funções do Popup de Pagamento
function openPaymentPopup() {
    const popup = document.getElementById('paymentPopup');
    if (popup) {
        popup.classList.remove('hidden');
        popup.classList.add('flex');
    }
}

function closePaymentPopup() {
    const popup = document.getElementById('paymentPopup');
    if (popup) {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }
}

function copyPixCode() {
    navigator.clipboard.writeText(PIX_CODE).then(() => {
        const feedback = document.querySelector('.copy-feedback');
        if (feedback) {
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        }
    }).catch(err => {
        console.error('Erro ao copiar código PIX:', err);
    });
}

function sendToWhatsApp() {
    const name = document.getElementById('name').value;
    if (!name) {
        alert('Por favor, insira seu nome');
        return;
    }

    // Obtém os dados do localStorage
    const total = localStorage.getItem('total') || 'R$ 0,00';
    const selectedStreamings = JSON.parse(localStorage.getItem('selectedStreamings') || '[]');
    const selectedVPS = localStorage.getItem('selectedVPS') || 'Nenhum';
    const streamingTotal = localStorage.getItem('streamingTotal') || 'R$ 0,00';
    const vpsPrice = localStorage.getItem('vpsPrice') || 'R$ 0,00';

    // Formata a mensagem dos streamings
    let streamingMessage = 'Nenhum';
    if (selectedStreamings.length > 0) {
        streamingMessage = selectedStreamings.map(id => {
            const package = STREAMING_PACKAGES[id];
            return `• ${package.name} - ${formatCurrency(package.price)}`;
        }).join('\n');
    }

    // Formata a mensagem completa
    const message = `*Nova Reserva*\n\n` +
        `*Nome:* ${name}\n\n` +
        `*Streamings Selecionados:*\n${streamingMessage}\n` +
        `*Total Streamings:* ${streamingTotal}\n\n` +
        `*VPS:* ${selectedVPS} (${vpsPrice})\n\n` +
        `*Total Geral:* ${total}`;

    // Codifica a mensagem e abre o WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    
    // Fecha o popup após enviar
    closePaymentPopup();
}

// Função para alternar a visibilidade das seções
window.toggleSection = function(contentId, arrowId) {
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);
    
    if (content && arrow) {
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            arrow.classList.add('rotate-180');
        } else {
            content.classList.add('hidden');
            arrow.classList.remove('rotate-180');
        }
    }
}; 