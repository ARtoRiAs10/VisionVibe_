'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { VisionVibeControls } from '@/types';
import { THEMES, BUDGETS } from '@/lib/constants';
import { SparkleIcon } from './icons';

interface DesignControlsProps {
  onGenerate: (controls: VisionVibeControls) => void;
  disabled: boolean;
}

export function DesignControls({ onGenerate, disabled }: DesignControlsProps) {
  const [theme, setTheme] = useState<string>('');
  const [subTheme, setSubTheme] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');

  const subThemes = theme ? THEMES[theme] || [] : [];

  const handleGenerate = () => {
    if (!theme || !subTheme || !budget) {
      alert('Please fill all required fields');
      return;
    }

    onGenerate({
      theme,
      subTheme,
      budget,
      prompt,
    });
  };

  return (
    <div className="w-full p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Customize Your Design
      </h2>

      <div className="space-y-4">
        {/* Theme Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme *
          </label>
          <select
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setSubTheme('');
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Select a theme</option>
            {Object.keys(THEMES).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Sub-Theme Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Style *
          </label>
          <select
            value={subTheme}
            onChange={(e) => setSubTheme(e.target.value)}
            disabled={!theme}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white disabled:opacity-50"
          >
            <option value="">Select a style</option>
            {subThemes.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Budget Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget *
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Select a budget</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Special Requests (optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add plants, modern lighting, wooden accents..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white resize-none"
            rows={4}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={disabled}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparkleIcon className="w-4 h-4" />
          Generate Design
        </Button>
      </div>
    </div>
  );
}
