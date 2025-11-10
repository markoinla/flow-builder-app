import { Label } from './ui/label';
import type { HandleConfig, HandleType } from '../types/node-types';

interface HandlePositionSelectorProps {
  value: HandleConfig;
  onChange: (config: HandleConfig) => void;
}

export function HandlePositionSelector({ value, onChange }: HandlePositionSelectorProps) {
  const handleToggle = (position: keyof HandleConfig) => {
    const isActive = value[position] === 'both';

    onChange({
      ...value,
      [position]: isActive ? undefined : 'both',
    });
  };

  const HandleDot = ({
    position,
    isActive,
    style
  }: {
    position: keyof HandleConfig;
    isActive: boolean;
    style: React.CSSProperties
  }) => (
    <button
      type="button"
      onClick={() => handleToggle(position)}
      className="absolute hover:scale-125 transition-transform cursor-pointer border-2 border-white shadow-md"
      style={{
        ...style,
        width: isActive ? 14 : 8,
        height: isActive ? 14 : 8,
        borderRadius: '50%',
        backgroundColor: isActive ? '#3b82f6' : '#9ca3af', // gray-400 when inactive
      }}
      title={`${position}: ${isActive ? 'enabled' : 'disabled'}`}
    />
  );

  return (
    <div className="space-y-2">
      <Label className="text-sm">Connection Handles</Label>
      <div className="relative w-full h-28 flex items-center justify-center">
        {/* Container for proper positioning */}
        <div className="relative w-32 h-20">
          {/* Center node preview */}
          <div className="absolute inset-0 bg-background border-2 border-border rounded shadow-sm flex items-center justify-center text-xs text-muted-foreground">
            Node
          </div>

          {/* Handle Dots - positioned on the borders */}
          <HandleDot
            position="top"
            isActive={value.top === 'both'}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
          <HandleDot
            position="right"
            isActive={value.right === 'both'}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translate(50%, -50%)'
            }}
          />
          <HandleDot
            position="bottom"
            isActive={value.bottom === 'both'}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translate(-50%, 50%)'
            }}
          />
          <HandleDot
            position="left"
            isActive={value.left === 'both'}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      </div>

      {/* Simple hint */}
      <p className="text-[10px] text-muted-foreground text-center">
        Click dots to toggle connection handles
      </p>
    </div>
  );
}
