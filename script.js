fetch('hardware.json')
  .then(response => response.json())
  .then(data => {
      
      let maxRow = 0;
      data.nodes.forEach(n => {
          if (n.data.row > maxRow) maxRow = n.data.row;
      });
      document.getElementById('cy').style.height = (maxRow * 60 + 300) + 'px';

      // Function to calculate exact horizontal centering
      function getCenteredOffsetX() {
          let graphWidth = 960; // 3 column spans * 320px
          return Math.max(50, (window.innerWidth - graphWidth) / 2);
      }

      var cy = cytoscape({
        container: document.getElementById('cy'),
        elements: data,
        
        autoungrabify: true,
        userPanningEnabled: false,
        userZoomingEnabled: false, 
        boxSelectionEnabled: false,
        
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(name)',
              'color': '#222222',
              'font-size': '13px',
              'font-weight': '600',
              'text-valign': 'center',
              'text-halign': 'right',
              'text-margin-x': 12,
              'shape': 'rectangle',
              'background-opacity': 0,
              'border-width': 0,
              'width': 32,
              'height': 32,
              'background-fit': 'contain',
              'background-position-x': '50%',
              'background-position-y': '50%',
              'background-image-opacity': 1,
              'transition-property': 'opacity',
              'transition-duration': '0.2s'
            }
          },
          
          { selector: 'node[type="chipset"]', style: { 'background-image': 'icons/chipset.png' } },
          { selector: 'node[type="year"]', style: { 'background-image': 'icons/year.png' } },
          { selector: 'node[type="motherboard"]', style: { 'background-image': 'icons/mobo.png' } },
          { selector: 'node[type="socket"]', style: { 'background-image': 'icons/socket.png' } },
          
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#d0d0d0',
              'curve-style': 'bezier',
              'opacity': 0.3,
              'transition-property': 'opacity, line-color, width',
              'transition-duration': '0.2s'
            }
          },
          { selector: '.dimmed', style: { 'opacity': 0.05 } },
          { selector: '.highlighted', style: { 'opacity': 1 } },
          {
            selector: 'edge.highlighted',
            style: { 'opacity': 1, 'width': 3, 'line-color': '#0074D9' }
          }
        ],
        
        layout: {
          name: 'preset',
          positions: function(node) {
            return {
              x: (node.data('col') * 320) + getCenteredOffsetX(), // Centers horizontally
              y: (node.data('row') * 60) + 160
            };
          }
        }
      });

      cy.ready(function() {
          cy.zoom(1);
          cy.pan({ x: 0, y: 0 });
      });

      // Responsive event: Re-center the network if the user resizes their browser
      window.addEventListener('resize', () => {
          let newOffsetX = getCenteredOffsetX();
          cy.nodes().forEach(node => {
              node.position({
                  x: (node.data('col') * 320) + newOffsetX,
                  y: (node.data('row') * 60) + 160
              });
          });
      });

      cy.on('mouseover', 'node', function(e) {
          document.getElementById('cy').style.cursor = 'pointer';
          var hoveredNode = e.target;
          cy.elements().addClass('dimmed');
          hoveredNode.removeClass('dimmed').addClass('highlighted');
          var connectedEdges = hoveredNode.connectedEdges();
          connectedEdges.addClass('highlighted').removeClass('dimmed');
          connectedEdges.connectedNodes().removeClass('dimmed').addClass('highlighted');
      });

      cy.on('mouseout', 'node', function(e) {
          document.getElementById('cy').style.cursor = 'default';
          cy.elements().removeClass('dimmed').removeClass('highlighted');
      });

      cy.on('tap', 'node[type="motherboard"]', function(e) {
          var nodeData = e.target.data();
          
          document.getElementById('sb-title').innerText = nodeData.name;
          document.getElementById('val-chip').innerText = nodeData.chip;
          document.getElementById('val-year').innerText = nodeData.year;
          document.getElementById('val-ff').innerText = nodeData.ff;
          document.getElementById('val-sock').innerText = nodeData.sock;
          
          var agpEl = document.getElementById('val-agp');
          agpEl.innerText = nodeData.agp ? 'Present' : 'None';
          agpEl.className = nodeData.agp ? 'data-val val-yes' : 'data-val val-no';
          
          var vidEl = document.getElementById('val-vid');
          vidEl.innerText = nodeData.vid ? nodeData.vid : 'None';
          vidEl.className = nodeData.vid ? (nodeData.vid.includes('Optional') ? 'data-val val-opt' : 'data-val val-yes') : 'data-val val-no';
          
          var audEl = document.getElementById('val-aud');
          audEl.innerText = nodeData.aud ? nodeData.aud : 'None';
          audEl.className = nodeData.aud ? (nodeData.aud.includes('Optional') ? 'data-val val-opt' : 'data-val val-yes') : 'data-val val-no';
          
          document.getElementById('btn-details').onclick = function() {
              window.open(nodeData.id + '.html', '_blank');
          };
          
          document.getElementById('info-overlay').style.display = 'flex';
      });
  })
  .catch(error => console.error('Error loading hardware JSON:', error));

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('info-overlay');
    const dragHandle = document.getElementById('drag-handle');
    const closeBtn = document.getElementById('close-btn');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }

    let isDragging = false;
    let startX, startY, initialX, initialY;

    if (dragHandle) {
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = overlay.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            overlay.style.right = 'auto'; 
            overlay.style.left = (initialX + dx) + 'px';
            overlay.style.top = (initialY + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
});
