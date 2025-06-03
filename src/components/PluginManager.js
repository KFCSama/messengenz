import React from 'react';

const PluginManager = ({ availablePlugins, activePlugins, onTogglePlugin }) => (
  <div className="plugin-manager">
    <h3>Plugins disponibles</h3>
    {Object.entries(availablePlugins).map(([id, plugin]) => (
      <div key={id} className="plugin-item">
        <label>
          <input
            type="checkbox"
            checked={activePlugins.includes(id)}
            onChange={() => onTogglePlugin(id)}
          />
          {plugin.name} (v{plugin.version}) - {plugin.description}
        </label>
      </div>
    ))}
  </div>
);

export default PluginManager;