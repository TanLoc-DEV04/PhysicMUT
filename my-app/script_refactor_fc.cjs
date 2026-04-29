const fs = require('fs');

const files = [
  'src/features/cyclotron/components/CyclotronGame.tsx',
  'src/features/cyclotron/components/CyclotronSimulation.tsx',
  'src/features/loudspeaker/components/LoudspeakerSimulation.tsx',
  'src/features/loudspeaker/components/LSGame.tsx',
  'src/features/mass-spectrometry/components/MassSpectrometerSimulation.tsx',
  'src/features/mass-spectrometry/components/MassSpectrumGraph.tsx',
  'src/features/mass-spectrometry/components/MSGame.tsx',
  'src/pages/(public)/model-detail/components/ai-generate/QuizViewer.tsx',
  'src/pages/(public)/model-detail/components/ai-generate/SlideViewer.tsx',
  'src/pages/(public)/model-detail/components/physicmut-bot/ChatInterface.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Replace \const Name: React.FC<Props> = ({ ...props }) => {\ with \export function Name({ ...props }: Props) {\
  // And \export default Name;\ removal.
  // Wait, some might just be \const Name: React.FC = () => {\
  
  let changed = false;
  
  // Find the exact name that is exported as default.
  const exportMatch = code.match(/export\s+default\s+([A-Za-z0-9_]+);/);
  const defaultExportName = exportMatch ? exportMatch[1] : null;

  code = code.replace(/const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC(?:<([^>]+)>)?\s*=\s*\(([\s\S]*?)\)\s*=>\s*\{/g, (match, name, propsType, args) => {
    changed = true;
    let newArgs = args.trim();
    if (propsType) {
        // if args is empty like () or just (props)
        if (newArgs === '') {
            newArgs = 'props: ' + propsType;
        } else if (!newArgs.includes(':')) {
            newArgs = newArgs + ': ' + propsType;
        }
    }
    
    // If it's the default export, we could do export default function
    // But the user asked for \export function Name\ and maybe remove \export default Name\?
    // Let's just do \export function Name\ and remove \export default Name\ later or let it be.
    // If we just do \export function Name\, and it's already \export const Name\, we need to handle that.
    
    return \export function \(\) {\;
  });
  
  // If we changed \const Name : ... = \ to \export function Name\, there might be a duplicate \export\ 
  // if it was \export const Name : ... = \
  code = code.replace(/export\s+export\s+function/g, 'export function');

  if (changed) {
    fs.writeFileSync(file, code);
    console.log('Refactored', file);
  }
}