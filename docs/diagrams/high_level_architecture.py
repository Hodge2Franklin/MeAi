import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# Create figure and axis
fig, ax = plt.subplots(figsize=(12, 10))

# Set background color
ax.set_facecolor('#f5f5f5')

# Main system container
main_system = patches.Rectangle((0.5, 0.5), 11, 9, 
                              fill=True, alpha=0.2, 
                              facecolor='#e6f2ff', 
                              edgecolor='#0066cc', 
                              linewidth=2, 
                              zorder=1)
ax.add_patch(main_system)

# Add title to main system
ax.text(6, 9.2, 'MeAi Companion System', 
       fontsize=16, fontweight='bold', 
       ha='center', va='center')

# Core components
# Mirror component
mirror = patches.Rectangle((1, 6), 3, 2, 
                         fill=True, alpha=0.7, 
                         facecolor='#ffcccc', 
                         edgecolor='#cc0000', 
                         linewidth=2, 
                         zorder=2)
ax.add_patch(mirror)
ax.text(2.5, 7, 'Mirror', fontsize=14, fontweight='bold', ha='center', va='center')
ax.text(2.5, 6.5, 'User Understanding', fontsize=10, ha='center', va='center')

# Synthesis component
synthesis = patches.Rectangle((4.5, 6), 3, 2, 
                            fill=True, alpha=0.7, 
                            facecolor='#ffffcc', 
                            edgecolor='#cccc00', 
                            linewidth=2, 
                            zorder=2)
ax.add_patch(synthesis)
ax.text(6, 7, 'Synthesis', fontsize=14, fontweight='bold', ha='center', va='center')
ax.text(6, 6.5, 'State Management', fontsize=10, ha='center', va='center')

# Bridge component
bridge = patches.Rectangle((8, 6), 3, 2, 
                         fill=True, alpha=0.7, 
                         facecolor='#ccffcc', 
                         edgecolor='#00cc00', 
                         linewidth=2, 
                         zorder=2)
ax.add_patch(bridge)
ax.text(9.5, 7, 'Bridge', fontsize=14, fontweight='bold', ha='center', va='center')
ax.text(9.5, 6.5, 'External Connections', fontsize=10, ha='center', va='center')

# Supporting systems
# Memory System
memory = patches.Rectangle((1, 3.5), 2.5, 1.5, 
                         fill=True, alpha=0.7, 
                         facecolor='#cce6ff', 
                         edgecolor='#0066cc', 
                         linewidth=2, 
                         zorder=2)
ax.add_patch(memory)
ax.text(2.25, 4.25, 'Memory System', fontsize=12, fontweight='bold', ha='center', va='center')

# Ritual Engine
ritual = patches.Rectangle((4, 3.5), 2.5, 1.5, 
                         fill=True, alpha=0.7, 
                         facecolor='#e6ccff', 
                         edgecolor='#6600cc', 
                         linewidth=2, 
                         zorder=2)
ax.add_patch(ritual)
ax.text(5.25, 4.25, 'Ritual Engine', fontsize=12, fontweight='bold', ha='center', va='center')

# MCP Client Interface
mcp = patches.Rectangle((7, 3.5), 2.5, 1.5, 
                      fill=True, alpha=0.7, 
                      facecolor='#ffccff', 
                      edgecolor='#cc00cc', 
                      linewidth=2, 
                      zorder=2)
ax.add_patch(mcp)
ax.text(8.25, 4.25, 'MCP Client Interface', fontsize=12, fontweight='bold', ha='center', va='center')

# Voice Engine
voice = patches.Rectangle((1, 1.5), 2.5, 1.5, 
                        fill=True, alpha=0.7, 
                        facecolor='#ffe6cc', 
                        edgecolor='#cc6600', 
                        linewidth=2, 
                        zorder=2)
ax.add_patch(voice)
ax.text(2.25, 2.25, 'Voice Engine', fontsize=12, fontweight='bold', ha='center', va='center')

# Breath System
breath = patches.Rectangle((4, 1.5), 2.5, 1.5, 
                         fill=True, alpha=0.7, 
                         facecolor='#ccffe6', 
                         edgecolor='#00cc66', 
                         linewidth=2, 
                         zorder=2)
ax.add_patch(breath)
ax.text(5.25, 2.25, 'Breath System', fontsize=12, fontweight='bold', ha='center', va='center')

# Ethics Engine
ethics = patches.Rectangle((7, 1.5), 2.5, 1.5, 
                         fill=True, alpha=0.7, 
                         facecolor='#e6e6e6', 
                         edgecolor='#666666', 
                         linewidth=2, 
                         zorder=2)
ax.add_patch(ethics)
ax.text(8.25, 2.25, 'Ethics Engine', fontsize=12, fontweight='bold', ha='center', va='center')

# Add arrows for relationships
# Mirror to Synthesis
ax.arrow(4, 7, 0.4, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)
ax.arrow(4.5, 6.8, -0.4, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Synthesis to Bridge
ax.arrow(7.5, 7, 0.4, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)
ax.arrow(8, 6.8, -0.4, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Mirror to Memory
ax.arrow(2.5, 6, 0, -0.9, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)
ax.arrow(2.3, 5.1, 0, 0.9, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Synthesis to Ritual
ax.arrow(5.25, 6, 0, -0.9, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Bridge to MCP
ax.arrow(8.25, 6, 0, -0.9, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Synthesis to Voice
ax.arrow(5.5, 6, -2.5, -3.5, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Synthesis to Breath
ax.arrow(5.25, 6, 0, -2.9, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Synthesis to Ethics
ax.arrow(6.5, 6, 1.5, -3.5, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Ethics to all components (simplified)
ax.arrow(8.25, 3, 0, 2.9, head_width=0.1, head_length=0.1, fc='black', ec='black', zorder=3)

# Remove axis ticks and labels
ax.set_xticks([])
ax.set_yticks([])
ax.set_xlim(0, 12)
ax.set_ylim(0, 10)

# Add legend for component types
legend_elements = [
    patches.Patch(facecolor='#ffcccc', edgecolor='#cc0000', label='Core - Mirror'),
    patches.Patch(facecolor='#ffffcc', edgecolor='#cccc00', label='Core - Synthesis'),
    patches.Patch(facecolor='#ccffcc', edgecolor='#00cc00', label='Core - Bridge'),
    patches.Patch(facecolor='#cce6ff', edgecolor='#0066cc', label='Supporting - Memory'),
    patches.Patch(facecolor='#e6ccff', edgecolor='#6600cc', label='Supporting - Ritual'),
    patches.Patch(facecolor='#e6e6e6', edgecolor='#666666', label='Supporting - Ethics')
]
ax.legend(handles=legend_elements, loc='upper center', bbox_to_anchor=(0.5, 0.45),
          fancybox=True, shadow=True, ncol=2)

# Add title and description
plt.title('MeAi System Architecture', fontsize=18, pad=20)
plt.figtext(0.5, 0.01, 'High-level architecture showing core components and supporting systems', 
            ha='center', fontsize=10)

# Save the figure
plt.tight_layout()
plt.savefig('/home/ubuntu/diagrams/high_level_architecture.png', dpi=300, bbox_inches='tight')
