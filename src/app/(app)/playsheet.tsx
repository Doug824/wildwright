/**
 * Playsheet Screen
 *
 * Full wildshape form details with computed stats.
 * Shows attacks, defense, skills, and active effects.
 */

import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCharacter } from '@/contexts';
import { useCreateWildShapeForm, useCharacterForms } from '@/hooks/useWildShapeForms';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { Card } from '@/components/ui/Card';
import { H2 } from '@/components/ui/Heading';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { getSizeModifiers, getTierForEDL } from '@/pf1e/tiers';
import { Tier } from '@/pf1e/types';
import { Tabs } from '@/components/ui/Tabs';
import { AttackRow } from '@/components/ui/AttackRow';
import { Button } from '@/components/ui/Button';
import { getAbilityDescription, SpecialAbility } from '@/pf1e/specialAbilities';
import { Toast } from '@/components/ui/Toast';
import { computePF1e } from '@/pf1e';
import { characterToBaseCharacter } from '@/pf1e/adapters';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 52,
    paddingBottom: 100,
  },
  cardMargin: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    color: '#4A3426',
    fontSize: 11,
    marginTop: 1,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  statsRowSpaced: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 4,
  },
  tabContent: {
    marginTop: 6,
  },
  sectionTitle: {
    color: '#4A3426',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  sectionSpacing: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 122, 61, 0.3)',
  },
  infoText: {
    color: '#4A3426',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(42, 74, 58, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7FD1A8',
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)',
    transform: [{ scale: 0.95 }],
  },
  backText: {
    color: '#F9F5EB',
    fontSize: 12,
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F9F5EB',
    borderRadius: 12,
    padding: 20,
    maxWidth: 500,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#B97A3D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3426',
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7FD1A8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4A3426',
    lineHeight: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#B97A3D',
    fontWeight: '700',
  },
  modifiersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  modifierButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(127, 209, 168, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7FD1A8',
  },
  modifierButtonText: {
    color: '#2A4A3A',
    fontSize: 12,
    fontWeight: '600',
  },
  modifierLabel: {
    color: '#6B5344',
    fontSize: 10,
    marginBottom: 2,
  },
});

export default function PlaysheetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Character context and forms hooks
  const { character, characterId } = useCharacter();
  const { data: myForms } = useCharacterForms(characterId);
  const createForm = useCreateWildShapeForm();

  // Toast state
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error' | 'info'>('success');

  const tabs = ['Attacks & Damage', 'Defense', 'Skills', 'Effects'];
  const [active, setActive] = React.useState(tabs[0]);

  // Active Effects State
  interface ActiveEffect {
    id: string;
    name: string;
    enabled: boolean;
    duration?: string;
    modifiers: {
      ac?: number;
      attack?: number;
      damage?: number;
      str?: number;
      dex?: number;
      con?: number;
      int?: number;
      wis?: number;
      cha?: number;
      damageDiceAdd?: string; // e.g., "2d6" for Holy
      damageDiceSteps?: number; // e.g., +1 for Enlarge Person
    };
  }

  const [activeEffects, setActiveEffects] = React.useState<ActiveEffect[]>([]);
  const [showAddEffect, setShowAddEffect] = React.useState(false);
  const [newEffectName, setNewEffectName] = React.useState('');

  // New effect form state
  const [newEffectAC, setNewEffectAC] = React.useState('');
  const [newEffectAttack, setNewEffectAttack] = React.useState('');
  const [newEffectDamage, setNewEffectDamage] = React.useState('');
  const [newEffectSTR, setNewEffectSTR] = React.useState('');
  const [newEffectDEX, setNewEffectDEX] = React.useState('');
  const [newEffectCON, setNewEffectCON] = React.useState('');
  const [newEffectINT, setNewEffectINT] = React.useState('');
  const [newEffectWIS, setNewEffectWIS] = React.useState('');
  const [newEffectCHA, setNewEffectCHA] = React.useState('');
  const [newEffectDamageDiceAdd, setNewEffectDamageDiceAdd] = React.useState('');
  const [newEffectDamageDiceSteps, setNewEffectDamageDiceSteps] = React.useState('');

  // Ability Description Modal State
  const [selectedAbility, setSelectedAbility] = React.useState<SpecialAbility | null>(null);
  const [showAbilityModal, setShowAbilityModal] = React.useState(false);

  // Parse computed data from params
  const computedData = React.useMemo(() => {
    if (params.computedData) {
      try {
        return JSON.parse(params.computedData as string);
      } catch (error) {
        console.error('Error parsing computed data:', error);
        return null;
      }
    }
    return null;
  }, [params.computedData]);

  // Parse form data from params or use default
  const formData = React.useMemo(() => {
    if (params.formData) {
      try {
        return JSON.parse(params.formData as string);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.formData]);

  // Parse template data (for preview from library)
  const templateData = React.useMemo(() => {
    if (params.templateData) {
      try {
        return JSON.parse(params.templateData as string);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.templateData]);

  // Attack/Damage Modifier State
  const [attackStatModifier, setAttackStatModifier] = React.useState<'STR' | 'DEX' | 'WIS'>('STR');
  const [damageStatModifier, setDamageStatModifier] = React.useState<'STR' | 'DEX' | 'WIS'>('STR');
  const [damageMultiplier, setDamageMultiplier] = React.useState<1 | 1.5 | 2>(1);
  const [recomputedData, setRecomputedData] = React.useState<any>(null);

  // Initialize modifiers from character data
  React.useEffect(() => {
    if (character?.combatStats) {
      setAttackStatModifier(character.combatStats.attackStatModifier || 'STR');
      setDamageStatModifier(character.combatStats.damageStatModifier || 'STR');
      setDamageMultiplier(character.combatStats.damageMultiplier || 1);
    }
  }, [character]);

  // Cycle through attack stat options
  const cycleAttackStat = () => {
    setAttackStatModifier(prev => {
      if (prev === 'STR') return 'DEX';
      if (prev === 'DEX') return 'WIS';
      return 'STR';
    });
  };

  // Cycle through damage stat options
  const cycleDamageStat = () => {
    setDamageStatModifier(prev => {
      if (prev === 'STR') return 'DEX';
      if (prev === 'DEX') return 'WIS';
      return 'STR';
    });
  };

  // Cycle through damage multiplier options
  const cycleDamageMultiplier = () => {
    setDamageMultiplier(prev => {
      if (prev === 1) return 1.5;
      if (prev === 1.5) return 2;
      return 1;
    });
  };

  // Recompute when modifiers change
  React.useEffect(() => {
    if (character && formData && computedData) {
      try {
        const baseChar = characterToBaseCharacter(character);
        // Update base character with new modifiers
        baseChar.attackStatModifier = attackStatModifier;
        baseChar.damageStatModifier = damageStatModifier;
        baseChar.damageMultiplier = damageMultiplier;

        // Apply ability score bonuses from effects
        const mods = calculateModifiers();
        baseChar.ability.str += mods.str;
        baseChar.ability.dex += mods.dex;
        baseChar.ability.con += mods.con;
        baseChar.ability.int += mods.int;
        baseChar.ability.wis += mods.wis;
        baseChar.ability.cha += mods.cha;

        // Get form from formData
        const form = {
          id: formData.id || formData.name,
          name: formData.name,
          kind: formData.requiredSpellLevel?.includes('Elemental') ? 'Elemental' as const :
                formData.requiredSpellLevel?.includes('Plant') ? 'Plant' as const : 'Animal' as const,
          baseSize: formData.size,
          naturalAttacks: (formData.statModifications?.naturalAttacks || []).map((attack: any) => ({
            type: attack.name.toLowerCase().includes('bite') ? 'bite' as const :
                  attack.name.toLowerCase().includes('claw') ? 'claw' as const :
                  attack.name.toLowerCase().includes('slam') ? 'slam' as const : 'other' as const,
            dice: attack.damage,
            count: attack.count || 1,
            primary: attack.type === 'primary',
            traits: [],
          })),
          movement: formData.statModifications?.movement || {},
          senses: formData.statModifications?.senses || {},
          traits: formData.statModifications?.specialAbilities || [],
          tags: formData.tags,
        };

        // Get tier and element
        const tier = formData.requiredSpellLevel;
        const element = form.name.toLowerCase().includes('air') ? 'Air' as const :
                       form.name.toLowerCase().includes('earth') ? 'Earth' as const :
                       form.name.toLowerCase().includes('fire') ? 'Fire' as const :
                       form.name.toLowerCase().includes('water') ? 'Water' as const : undefined;

        // Recompute
        const newComputed = computePF1e({
          base: baseChar,
          form,
          tier,
          chosenSize: formData.size,
          element,
        });

        setRecomputedData(newComputed);
      } catch (error) {
        console.error('Error recomputing:', error);
      }
    }
  }, [attackStatModifier, damageStatModifier, damageMultiplier, character, formData, computedData, activeEffects]);

  // Use recomputed data if available, otherwise computed data, template/form data for preview, otherwise fall back to mock
  const activeComputedData = recomputedData || computedData;
  const form = activeComputedData ? {
    name: formData?.name || 'Wild Shape',
    size: activeComputedData.size,
    spell: formData?.requiredSpellLevel || formData?.spell || 'Beast Shape',
    movement: (() => {
      const parts = [];
      // Always show land speed
      if (activeComputedData.movement.land) parts.push(`${activeComputedData.movement.land} ft`);
      // Only show other movement types if the FORM has them (not inherited from base character)
      if (formData?.statModifications?.movement?.climb) parts.push(`Climb ${activeComputedData.movement.climb} ft`);
      if (formData?.statModifications?.movement?.swim) parts.push(`Swim ${activeComputedData.movement.swim} ft`);
      if (formData?.statModifications?.movement?.fly) parts.push(`Fly ${activeComputedData.movement.fly} ft`);
      if (formData?.statModifications?.movement?.burrow) parts.push(`Burrow ${activeComputedData.movement.burrow} ft`);
      return parts.join(', ');
    })(),
    attacks: activeComputedData.attacks.map((attack: any) => ({
      name: attack.name,
      bonus: attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`,
      damage: attack.damageDice,
      // Show all traits for this attack, joined with commas
      trait: attack.traits && attack.traits.length > 0 ? attack.traits.join(', ') : undefined,
    })),
    // Use form-specific abilities, not computed traits (which include tier grants)
    abilities: formData?.statModifications?.specialAbilities || [],
    stats: {
      hp: activeComputedData.hp.max,
      ac: activeComputedData.ac.total,
      touchAC: activeComputedData.ac.touch,
      flatFootedAC: activeComputedData.ac.flatFooted,
      speed: `${activeComputedData.movement.land} ft`,
    },
  } : templateData ? {
    // Template preview (from library)
    name: templateData.name,
    size: templateData.size,
    spell: templateData.requiredSpellLevel,
    movement: (() => {
      const parts = [];
      const m = templateData.statModifications.movement;
      if (m.land) parts.push(`${m.land} ft`);
      if (m.climb) parts.push(`Climb ${m.climb} ft`);
      if (m.swim) parts.push(`Swim ${m.swim} ft`);
      if (m.fly) parts.push(`Fly ${m.fly} ft`);
      if (m.burrow) parts.push(`Burrow ${m.burrow} ft`);
      return parts.join(', ');
    })(),
    attacks: templateData.statModifications.naturalAttacks.map((attack: any) => ({
      name: attack.name,
      bonus: '—',
      damage: attack.damage,
      trait: attack.traits?.[0],
    })),
    abilities: templateData.statModifications.specialAbilities,
    stats: { hp: '—', ac: '—', speed: `${templateData.statModifications.movement.land || 30} ft` },
  } : formData ? {
    // Form preview from Forms page (learned forms)
    name: formData.name,
    size: formData.size,
    spell: formData.requiredSpellLevel,
    movement: (() => {
      const parts = [];
      const m = formData.statModifications.movement;
      if (m.land) parts.push(`${m.land} ft`);
      if (m.climb) parts.push(`Climb ${m.climb} ft`);
      if (m.swim) parts.push(`Swim ${m.swim} ft`);
      if (m.fly) parts.push(`Fly ${m.fly} ft`);
      if (m.burrow) parts.push(`Burrow ${m.burrow} ft`);
      return parts.join(', ');
    })(),
    attacks: formData.statModifications.naturalAttacks.map((attack: any) => ({
      name: attack.name,
      bonus: '—',
      damage: attack.damage,
      trait: attack.traits?.[0],
    })),
    abilities: formData.statModifications.specialAbilities,
    stats: { hp: '—', ac: '—', speed: `${formData.statModifications.movement.land || 30} ft` },
  } : {
    // Default mock data for development
    name: 'Leopard',
    size: 'Large',
    spell: 'Beast Shape III',
    movement: '40 ft, Climb 20 ft',
    attacks: [
      { name: 'Bite', bonus: '+14', damage: '1d8+9', trait: 'Grab' },
      { name: 'Claw', bonus: '+14', damage: '1d4+9' },
      { name: 'Claw', bonus: '+14', damage: '1d4+9' },
    ],
    abilities: ['Pounce', 'Low-light vision', 'Scent'],
    stats: { hp: 64, ac: 19, speed: '40 ft' },
  };

  const handleRevertForm = () => {
    // Navigate back to home and clear active form
    router.push({
      pathname: '/(app)/home',
      params: { clearActiveForm: 'true' }
    });
  };

  const handleSwitchForm = () => {
    // Navigate to forms to select a different one
    router.push('/(app)/forms');
  };

  // Assume form with computed stats
  const handleAssumeForm = () => {
    if (!formData || !character) {
      setToastMessage('Missing form or character data');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    try {
      // Convert to PF1e format
      const baseChar = characterToBaseCharacter(character);

      // Convert form to PF1e format
      const pf1eForm = {
        id: formData.id,
        name: formData.name,
        kind: formData.tags?.includes('elemental') ? 'Elemental' :
              formData.tags?.includes('plant') ? 'Plant' :
              formData.tags?.includes('magical-beast') ? 'Magical Beast' : 'Animal',
        baseSize: formData.size,
        naturalAttacks: formData.statModifications.naturalAttacks.map((attack: any) => ({
          type: attack.name.toLowerCase() as any,
          dice: attack.damage,
          primary: true,
          traits: attack.traits || [],
        })),
        movement: formData.statModifications.movement,
        senses: formData.statModifications.senses || {},
        traits: formData.statModifications.specialAbilities || [],
      };

      // Use the tier from the form itself (already validated when it was added)
      // Forms store their required spell level which IS the tier
      const tier = formData.requiredSpellLevel || formData.spell || 'Beast Shape I';

      // Extract element type for Elemental forms
      let element: 'Air' | 'Earth' | 'Fire' | 'Water' | undefined;
      if (pf1eForm.kind === 'Elemental') {
        const nameLower = formData.name.toLowerCase();
        const allText = [nameLower, ...formData.tags.map((t: string) => t.toLowerCase())].join(' ');
        if (allText.includes('air')) element = 'Air';
        else if (allText.includes('earth')) element = 'Earth';
        else if (allText.includes('fire')) element = 'Fire';
        else if (allText.includes('water')) element = 'Water';
      }

      console.log('[PLAYSHEET] Assuming form with:', {
        name: formData.name,
        size: formData.size,
        tier,
        element,
        kind: pf1eForm.kind
      });

      // Compute stats
      const computedPlaysheet = computePF1e({
        base: baseChar,
        form: pf1eForm as any,
        tier,
        chosenSize: formData.size,
        element,
      });

      console.log('[PLAYSHEET] Computed AC:', computedPlaysheet.ac);

      // Navigate with computed data
      router.push({
        pathname: '/(app)/home',
        params: {
          assumedFormData: JSON.stringify({
            ...formData,
            computed: computedPlaysheet,
            tier,
          })
        }
      });
    } catch (error: unknown) {
      console.error('Error computing form stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Failed to assume form: ${errorMessage}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  // Check if template is already learned
  const isAlreadyLearned = React.useMemo(() => {
    if (!templateData || !myForms) return false;
    // Check if any of user's forms have the same name as the template
    return myForms.some(form => form.name.toLowerCase() === templateData.name.toLowerCase());
  }, [templateData, myForms]);

  // Learn form handler (for templates from library)
  const handleLearnForm = async () => {
    if (!templateData || !characterId) return;

    if (isAlreadyLearned) {
      setToastMessage('You have already learned this form!');
      setToastType('info');
      setToastVisible(true);
      return;
    }

    try {
      // Create a new form based on the template
      await createForm.mutateAsync({
        characterId,
        formData: {
          name: templateData.name,
          size: templateData.size,
          requiredSpellLevel: templateData.requiredSpellLevel,
          tags: templateData.tags || [],
          isFavorite: false,
          statModifications: templateData.statModifications,
        },
      });

      setToastMessage(`${templateData.name} added to your forms!`);
      setToastType('success');
      setToastVisible(true);

      // Navigate back to library after a short delay
      setTimeout(() => {
        router.push('/(app)/library');
      }, 1500);
    } catch (error: unknown) {
      console.error('Error learning form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Failed to learn form: ${errorMessage}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  // Ability Description Handler
  const handleAbilityPress = (abilityName: string) => {
    const ability = getAbilityDescription(abilityName);
    if (ability) {
      setSelectedAbility(ability);
      setShowAbilityModal(true);
    }
  };

  // Active Effects Handlers
  const addEffect = () => {
    if (!newEffectName) return;

    // Build modifiers object from non-empty fields
    const modifiers: ActiveEffect['modifiers'] = {};
    if (newEffectAC) modifiers.ac = parseInt(newEffectAC);
    if (newEffectAttack) modifiers.attack = parseInt(newEffectAttack);
    if (newEffectDamage) modifiers.damage = parseInt(newEffectDamage);
    if (newEffectSTR) modifiers.str = parseInt(newEffectSTR);
    if (newEffectDEX) modifiers.dex = parseInt(newEffectDEX);
    if (newEffectCON) modifiers.con = parseInt(newEffectCON);
    if (newEffectINT) modifiers.int = parseInt(newEffectINT);
    if (newEffectWIS) modifiers.wis = parseInt(newEffectWIS);
    if (newEffectCHA) modifiers.cha = parseInt(newEffectCHA);
    if (newEffectDamageDiceAdd) modifiers.damageDiceAdd = newEffectDamageDiceAdd;
    if (newEffectDamageDiceSteps) modifiers.damageDiceSteps = parseInt(newEffectDamageDiceSteps);

    // Require at least one modifier
    if (Object.keys(modifiers).length === 0) return;

    const effect: ActiveEffect = {
      id: Date.now().toString(),
      name: newEffectName,
      modifiers,
      enabled: true,
    };

    setActiveEffects(prev => [...prev, effect]);

    // Clear form
    setNewEffectName('');
    setNewEffectAC('');
    setNewEffectAttack('');
    setNewEffectDamage('');
    setNewEffectSTR('');
    setNewEffectDEX('');
    setNewEffectCON('');
    setNewEffectINT('');
    setNewEffectWIS('');
    setNewEffectCHA('');
    setNewEffectDamageDiceAdd('');
    setNewEffectDamageDiceSteps('');
    setShowAddEffect(false);
  };

  const removeEffect = (id: string) => {
    setActiveEffects(prev => prev.filter(e => e.id !== id));
  };

  const toggleEffect = (id: string) => {
    setActiveEffects(prev => prev.map(e =>
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ));
  };

  // Calculate total modifiers from active effects (only enabled ones)
  const calculateModifiers = () => {
    const modifiers = {
      ac: 0,
      attack: 0,
      damage: 0,
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
      damageDiceAdd: [] as string[],
      damageDiceSteps: 0,
    };

    activeEffects.forEach(effect => {
      if (!effect.enabled) return; // Skip disabled effects

      if (effect.modifiers.ac) modifiers.ac += effect.modifiers.ac;
      if (effect.modifiers.attack) modifiers.attack += effect.modifiers.attack;
      if (effect.modifiers.damage) modifiers.damage += effect.modifiers.damage;
      if (effect.modifiers.str) modifiers.str += effect.modifiers.str;
      if (effect.modifiers.dex) modifiers.dex += effect.modifiers.dex;
      if (effect.modifiers.con) modifiers.con += effect.modifiers.con;
      if (effect.modifiers.int) modifiers.int += effect.modifiers.int;
      if (effect.modifiers.wis) modifiers.wis += effect.modifiers.wis;
      if (effect.modifiers.cha) modifiers.cha += effect.modifiers.cha;
      if (effect.modifiers.damageDiceAdd) modifiers.damageDiceAdd.push(effect.modifiers.damageDiceAdd);
      if (effect.modifiers.damageDiceSteps) modifiers.damageDiceSteps += effect.modifiers.damageDiceSteps;
    });

    return modifiers;
  };

  const modifiers = calculateModifiers();

  // Helper to get tier from spell level
  // IMPORTANT: Check higher tiers first to avoid matching "Beast Shape I" in "Beast Shape III"
  const getTierFromSpell = (spell: string): Tier | null => {
    if (spell?.includes('Beast Shape IV')) return 'Beast Shape IV';
    if (spell?.includes('Beast Shape III')) return 'Beast Shape III';
    if (spell?.includes('Beast Shape II')) return 'Beast Shape II';
    if (spell?.includes('Beast Shape I')) return 'Beast Shape I';
    if (spell?.includes('Elemental Body IV')) return 'Elemental Body IV';
    if (spell?.includes('Elemental Body III')) return 'Elemental Body III';
    if (spell?.includes('Elemental Body II')) return 'Elemental Body II';
    if (spell?.includes('Elemental Body I')) return 'Elemental Body I';
    if (spell?.includes('Plant Shape III')) return 'Plant Shape III';
    if (spell?.includes('Plant Shape II')) return 'Plant Shape II';
    if (spell?.includes('Plant Shape I')) return 'Plant Shape I';
    return null;
  };

  // Get tier and size modifiers for preview
  const tier = getTierFromSpell(form.spell);

  // Detect element type for elementals
  const getElementType = (formName: string): string | undefined => {
    const nameLower = formName.toLowerCase();
    if (nameLower.includes('air')) return 'Air';
    if (nameLower.includes('earth')) return 'Earth';
    if (nameLower.includes('fire')) return 'Fire';
    if (nameLower.includes('water')) return 'Water';
    return undefined;
  };

  const elementType = getElementType(form.name);
  const sizeModifiers = tier ? getSizeModifiers(tier, form.size, elementType) : {};

  // Helper to get EDL requirement
  const getEDLRequirement = (tier: Tier | null): string => {
    if (!tier) return 'Unknown';
    if (tier === 'Beast Shape I') return '4+';
    if (tier === 'Beast Shape II' || tier === 'Elemental Body I') return '6+';
    if (tier === 'Beast Shape III' || tier === 'Elemental Body II' || tier === 'Plant Shape I') return '8+';
    if (tier === 'Elemental Body III' || tier === 'Plant Shape II') return '10+';
    if (tier === 'Elemental Body IV' || tier === 'Plant Shape III') return '12+';
    return 'Unknown';
  };

  return (
    <View style={styles.container}>
      <LivingForestBg>
        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Requirements & Modifiers Card (for preview) */}
          {(templateData || (formData && params.fromForms === 'true')) && (
            <Card style={styles.cardMargin}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Requirements & Modifiers
              </Text>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B5344', marginBottom: 4 }}>
                  MINIMUM EDL REQUIRED
                </Text>
                <Text style={{ fontSize: 16, color: '#4A3426', fontWeight: '600' }}>
                  Level {getEDLRequirement(tier)}
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B5344', marginBottom: 4 }}>
                  SIZE & TIER
                </Text>
                <Text style={{ fontSize: 16, color: '#4A3426' }}>
                  {form.size} • {form.spell}
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B5344', marginBottom: 6 }}>
                  STAT MODIFIERS (when assumed)
                </Text>
                {sizeModifiers.str && (
                  <Text style={{ fontSize: 14, color: sizeModifiers.str > 0 ? '#2A4A3A' : '#8B4513', marginBottom: 3 }}>
                    • {sizeModifiers.str > 0 ? '+' : ''}{sizeModifiers.str} Strength (size {sizeModifiers.str > 0 ? 'bonus' : 'penalty'})
                  </Text>
                )}
                {sizeModifiers.dex && (
                  <Text style={{ fontSize: 14, color: sizeModifiers.dex > 0 ? '#2A4A3A' : '#8B4513', marginBottom: 3 }}>
                    • {sizeModifiers.dex > 0 ? '+' : ''}{sizeModifiers.dex} Dexterity (size {sizeModifiers.dex > 0 ? 'bonus' : 'penalty'})
                  </Text>
                )}
                {sizeModifiers.con && (
                  <Text style={{ fontSize: 14, color: sizeModifiers.con > 0 ? '#2A4A3A' : '#8B4513', marginBottom: 3 }}>
                    • {sizeModifiers.con > 0 ? '+' : ''}{sizeModifiers.con} Constitution (size {sizeModifiers.con > 0 ? 'bonus' : 'penalty'})
                  </Text>
                )}
                {sizeModifiers.naturalArmor && (
                  <Text style={{ fontSize: 14, color: '#2A4A3A', marginBottom: 3 }}>
                    • +{sizeModifiers.naturalArmor} Natural Armor
                  </Text>
                )}
                {!sizeModifiers.str && !sizeModifiers.dex && !sizeModifiers.con && !sizeModifiers.naturalArmor && (
                  <Text style={{ fontSize: 14, color: '#8B4513', fontStyle: 'italic' }}>
                    No stat modifiers for this size/tier combination
                  </Text>
                )}
              </View>

              {/* AC Impact Preview */}
              <View style={{ marginBottom: 8, padding: 10, backgroundColor: 'rgba(127, 209, 168, 0.15)', borderRadius: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#2A4A3A', marginBottom: 6 }}>
                  AC IMPACT
                </Text>
                {(() => {
                  const getSizeACBonus = (size: string): number => {
                    const sizeMap: Record<string, number> = {
                      'Fine': +8, 'Diminutive': +4, 'Tiny': +2, 'Small': +1,
                      'Medium': 0, 'Large': -1, 'Huge': -2, 'Gargantuan': -4, 'Colossal': -8
                    };
                    return sizeMap[size] || 0;
                  };

                  const sizeACBonus = getSizeACBonus(form.size);
                  const formNaturalArmor = sizeModifiers.naturalArmor || 0;

                  // Calculate natural armor delta (uses max, not stacking)
                  const baseNaturalArmor = character?.combatStats?.baseNaturalArmor || 0;
                  const naturalArmorDelta = Math.max(formNaturalArmor, baseNaturalArmor) - baseNaturalArmor;

                  const dexChange = sizeModifiers.dex || 0;
                  const dexACChange = Math.floor(dexChange / 2);
                  const totalACChange = sizeACBonus + naturalArmorDelta + dexACChange;

                  return (
                    <>
                      {sizeACBonus !== 0 && (
                        <Text style={{ fontSize: 13, color: '#2A4A3A', marginBottom: 2 }}>
                          • {sizeACBonus > 0 ? '+' : ''}{sizeACBonus} from size ({form.size})
                        </Text>
                      )}
                      {naturalArmorDelta > 0 && (
                        <Text style={{ fontSize: 13, color: '#2A4A3A', marginBottom: 2 }}>
                          • +{naturalArmorDelta} from natural armor (form grants {formNaturalArmor}, you have {baseNaturalArmor})
                        </Text>
                      )}
                      {naturalArmorDelta === 0 && formNaturalArmor > 0 && (
                        <Text style={{ fontSize: 13, color: '#8B4513', marginBottom: 2, fontStyle: 'italic' }}>
                          • No natural armor benefit (form grants {formNaturalArmor}, you already have {baseNaturalArmor})
                        </Text>
                      )}
                      {dexACChange !== 0 && (
                        <Text style={{ fontSize: 13, color: dexACChange > 0 ? '#2A4A3A' : '#8B4513', marginBottom: 2 }}>
                          • {dexACChange > 0 ? '+' : ''}{dexACChange} from Dex change ({dexChange > 0 ? '+' : ''}{dexChange} Dex)
                        </Text>
                      )}
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#2A4A3A', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(42, 74, 58, 0.3)' }}>
                        Total AC Change: {totalACChange > 0 ? '+' : ''}{totalACChange}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </Card>
          )}

          {/* Header Card with Stats */}
          <Card style={styles.cardMargin}>
            {/* Header Section */}
            <View style={styles.headerRow}>
              <View style={styles.headerContent}>
                <H2>{form.name}</H2>
                <Text style={styles.subtitle}>
                  {form.size} • {form.spell}
                </Text>
              </View>
            </View>

            {/* Abilities Row */}
            <View style={styles.chipRow}>
              {form.abilities?.map((ability, idx) => (
                <Pressable key={idx} onPress={() => handleAbilityPress(ability)}>
                  <Chip label={ability} variant="mist" />
                </Pressable>
              ))}
            </View>

            {/* Stats Section */}
            <View style={styles.sectionSpacing}>
              <View style={styles.statsRow}>
                <Stat label="HP" value={`${form.stats?.hp || 0}`} />
                <Stat
                  label="AC"
                  value={String((form.stats?.ac || 0) + modifiers.ac)}
                  sub={modifiers.ac !== 0 ? `(${modifiers.ac > 0 ? '+' : ''}${modifiers.ac})` : undefined}
                />
                <Stat label="Speed" value={form.movement || 'Unknown'} />
              </View>
            </View>
          </Card>

          {/* Tabs */}
          <Tabs tabs={tabs} active={active} onChange={setActive} />

          {/* Attacks & Damage Tab */}
          {active === 'Attacks & Damage' && (
            <Card style={styles.tabContent}>
              {/* Only show modifiers for computed data (not template preview) */}
              {computedData && character && (
                <>
                  <Text style={styles.sectionTitle}>
                    Attack & Damage Modifiers
                  </Text>
                  <View style={styles.modifiersRow}>
                    <Pressable onPress={cycleAttackStat} style={styles.modifierButton}>
                      <Text style={styles.modifierLabel}>Attack Stat</Text>
                      <Text style={styles.modifierButtonText}>{attackStatModifier}</Text>
                    </Pressable>
                    <Pressable onPress={cycleDamageStat} style={styles.modifierButton}>
                      <Text style={styles.modifierLabel}>Damage Stat</Text>
                      <Text style={styles.modifierButtonText}>{damageStatModifier}</Text>
                    </Pressable>
                    <Pressable onPress={cycleDamageMultiplier} style={styles.modifierButton}>
                      <Text style={styles.modifierLabel}>Damage Multi</Text>
                      <Text style={styles.modifierButtonText}>×{damageMultiplier}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Text style={styles.sectionTitle}>
                Natural Attacks
              </Text>
              {form.attacks?.map((attack, idx) => {
                // Parse attack bonus and apply modifiers
                const baseBonus = attack.bonus === '—' ? 0 : parseInt(attack.bonus.replace('+', ''));
                const modifiedBonus = baseBonus + modifiers.attack;
                const displayBonus = modifiedBonus >= 0 ? `+${modifiedBonus}` : `${modifiedBonus}`;

                // Parse damage to separate dice and modifier
                const damageMatch = attack.damage.match(/^(\d+d\d+)([+-]\d+)?$/);
                let displayDamage = attack.damage;

                if (damageMatch) {
                  const dice = damageMatch[1]; // e.g., "2d6"
                  const baseDamageMod = damageMatch[2] ? parseInt(damageMatch[2]) : 0; // e.g., 15 from "+15"
                  const totalDamageMod = baseDamageMod + modifiers.damage;

                  // Combine into single modifier
                  if (totalDamageMod !== 0) {
                    displayDamage = `${dice}${totalDamageMod > 0 ? '+' : ''}${totalDamageMod}`;
                  } else {
                    displayDamage = dice;
                  }
                } else if (modifiers.damage !== 0) {
                  // Fallback: just append if we can't parse
                  displayDamage = `${attack.damage}${modifiers.damage > 0 ? '+' : ''}${modifiers.damage}`;
                }

                return (
                  <AttackRow
                    key={idx}
                    name={attack.name}
                    bonus={displayBonus}
                    damage={displayDamage}
                    trait={attack.trait}
                  />
                );
              })}

              <Text style={styles.infoText}>
                Full Attack: {form.attacks?.map(a => `${a.name} ${a.bonus} (${a.damage}${a.trait ? ` plus ${a.trait.toLowerCase()}` : ''})`).join(', ')}
              </Text>
            </Card>
          )}

          {/* Defense Tab */}
          {active === 'Defense' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Armor Class
              </Text>
              <View style={styles.statsRow}>
                <Stat
                  label="Total AC"
                  value={String((form.stats?.ac || 0) + modifiers.ac)}
                  sub={modifiers.ac !== 0 ? `(${modifiers.ac > 0 ? '+' : ''}${modifiers.ac})` : undefined}
                />
                <Stat
                  label="Touch"
                  value={String((form.stats?.touchAC || 0) + modifiers.ac)}
                  sub="Dex + Size"
                />
                <Stat
                  label="Flat-Footed"
                  value={String((form.stats?.flatFootedAC || 0) + modifiers.ac)}
                  sub="No Dex"
                />
              </View>

              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionTitle}>
                  Special Abilities
                </Text>
                <View style={styles.chipRow}>
                  {form.abilities?.map((ability, idx) => (
                    <Pressable key={idx} onPress={() => handleAbilityPress(ability)}>
                      <Chip label={ability} variant="mist" />
                    </Pressable>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Skills Tab */}
          {active === 'Skills' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Skill Modifiers
              </Text>
              <View style={styles.statsRow}>
                <Stat label="Perception" value="+15" />
                <Stat label="Stealth" value="+18" sub="(+4 size, +4 Dex)" />
                <Stat label="Acrobatics" value="+12" sub="(+4 Dex)" />
                <Stat label="Climb" value="+13" />
                <Stat label="Swim" value="+9" />
              </View>
            </Card>
          )}

          {/* Effects Tab */}
          {active === 'Effects' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Active Effects
              </Text>

              {/* Modifiers Summary */}
              {activeEffects.length > 0 && (
                <View style={{ marginBottom: 12, padding: 12, backgroundColor: 'rgba(127, 209, 168, 0.1)', borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: '#2A4A3A', fontWeight: '700', marginBottom: 4 }}>
                    TOTAL MODIFIERS
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {modifiers.ac !== 0 && (
                      <Text style={{ fontSize: 14, color: '#2A4A3A' }}>
                        AC: {modifiers.ac > 0 ? '+' : ''}{modifiers.ac}
                      </Text>
                    )}
                    {modifiers.attack !== 0 && (
                      <Text style={{ fontSize: 14, color: '#2A4A3A' }}>
                        Attack: {modifiers.attack > 0 ? '+' : ''}{modifiers.attack}
                      </Text>
                    )}
                    {modifiers.damage !== 0 && (
                      <Text style={{ fontSize: 14, color: '#2A4A3A' }}>
                        Damage: {modifiers.damage > 0 ? '+' : ''}{modifiers.damage}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Active Effects List */}
              {activeEffects.map(effect => {
                // Build a readable list of all modifiers for this effect
                const modList = [];
                if (effect.modifiers.ac) modList.push(`AC ${effect.modifiers.ac > 0 ? '+' : ''}${effect.modifiers.ac}`);
                if (effect.modifiers.attack) modList.push(`Attack ${effect.modifiers.attack > 0 ? '+' : ''}${effect.modifiers.attack}`);
                if (effect.modifiers.damage) modList.push(`Damage ${effect.modifiers.damage > 0 ? '+' : ''}${effect.modifiers.damage}`);
                if (effect.modifiers.str) modList.push(`STR ${effect.modifiers.str > 0 ? '+' : ''}${effect.modifiers.str}`);
                if (effect.modifiers.dex) modList.push(`DEX ${effect.modifiers.dex > 0 ? '+' : ''}${effect.modifiers.dex}`);
                if (effect.modifiers.con) modList.push(`CON ${effect.modifiers.con > 0 ? '+' : ''}${effect.modifiers.con}`);
                if (effect.modifiers.int) modList.push(`INT ${effect.modifiers.int > 0 ? '+' : ''}${effect.modifiers.int}`);
                if (effect.modifiers.wis) modList.push(`WIS ${effect.modifiers.wis > 0 ? '+' : ''}${effect.modifiers.wis}`);
                if (effect.modifiers.cha) modList.push(`CHA ${effect.modifiers.cha > 0 ? '+' : ''}${effect.modifiers.cha}`);
                if (effect.modifiers.damageDiceAdd) modList.push(`+${effect.modifiers.damageDiceAdd} damage`);
                if (effect.modifiers.damageDiceSteps) modList.push(`Dice size ${effect.modifiers.damageDiceSteps > 0 ? '+' : ''}${effect.modifiers.damageDiceSteps} steps`);

                return (
                  <View key={effect.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 12, backgroundColor: effect.enabled ? 'rgba(127, 209, 168, 0.15)' : 'rgba(139, 115, 85, 0.1)', borderRadius: 8, opacity: effect.enabled ? 1 : 0.5 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#4A3426' }}>
                        {effect.name} {!effect.enabled && '(Disabled)'}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B5344' }}>
                        {modList.join(', ')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <Pressable onPress={() => toggleEffect(effect.id)} style={{ padding: 8, backgroundColor: effect.enabled ? '#7FD1A8' : '#E8DCC8', borderRadius: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: effect.enabled ? '#2A4A3A' : '#6B5344' }}>
                          {effect.enabled ? 'ON' : 'OFF'}
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => removeEffect(effect.id)} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 16, color: '#B97A3D' }}>✕</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}

              {activeEffects.length === 0 && !showAddEffect && (
                <Text style={styles.infoText}>
                  No active effects. Add buffs, debuffs, or temporary modifiers.
                </Text>
              )}

              {/* Add Effect Form */}
              {showAddEffect && (
                <ScrollView style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(185, 122, 61, 0.1)', borderRadius: 8, maxHeight: 500 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                    ADD EFFECT
                  </Text>

                  <TextInput
                    placeholder="Effect name (e.g., Rage, Bull's Strength, Holy)"
                    value={newEffectName}
                    onChangeText={setNewEffectName}
                    style={{ backgroundColor: '#FFF', padding: 10, borderRadius: 4, marginBottom: 12, borderWidth: 1, borderColor: '#8B7355', fontSize: 14 }}
                  />

                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4A3426', marginBottom: 8, marginTop: 4 }}>
                    COMBAT MODIFIERS
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>AC</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectAC}
                        onChangeText={setNewEffectAC}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>Attack</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectAttack}
                        onChangeText={setNewEffectAttack}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>Damage</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectDamage}
                        onChangeText={setNewEffectDamage}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4A3426', marginBottom: 8, marginTop: 4 }}>
                    ABILITY SCORES
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>STR</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectSTR}
                        onChangeText={setNewEffectSTR}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>DEX</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectDEX}
                        onChangeText={setNewEffectDEX}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>CON</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectCON}
                        onChangeText={setNewEffectCON}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>INT</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectINT}
                        onChangeText={setNewEffectINT}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>WIS</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectWIS}
                        onChangeText={setNewEffectWIS}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>CHA</Text>
                      <TextInput
                        placeholder="0"
                        value={newEffectCHA}
                        onChangeText={setNewEffectCHA}
                        keyboardType="numeric"
                        style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                      />
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4A3426', marginBottom: 8, marginTop: 4 }}>
                    DAMAGE DICE MODIFIERS
                  </Text>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>Add Damage Dice (e.g., "2d6" for Holy)</Text>
                    <TextInput
                      placeholder="e.g., 2d6"
                      value={newEffectDamageDiceAdd}
                      onChangeText={setNewEffectDamageDiceAdd}
                      style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                    />
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 11, color: '#6B5344', marginBottom: 4 }}>Dice Size Steps (e.g., +1 for Enlarge: 1d6→1d8)</Text>
                    <TextInput
                      placeholder="0"
                      value={newEffectDamageDiceSteps}
                      onChangeText={setNewEffectDamageDiceSteps}
                      keyboardType="numeric"
                      style={{ backgroundColor: '#FFF', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#8B7355' }}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <Button variant="outline" onPress={() => setShowAddEffect(false)} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button onPress={addEffect} style={{ flex: 1 }}>
                      Add Effect
                    </Button>
                  </View>
                </ScrollView>
              )}

              {/* Add Effect Button */}
              {!showAddEffect && (
                <Button onPress={() => setShowAddEffect(true)} fullWidth style={{ marginTop: 12 }}>
                  + Add Effect
                </Button>
              )}
            </Card>
          )}

          {/* Footer Actions */}
          {templateData ? (
            /* Template preview - show Learn Form and Back buttons */
            <View>
              {isAlreadyLearned && (
                <Card style={{ marginBottom: 12, padding: 12, backgroundColor: 'rgba(127, 209, 168, 0.2)', borderColor: '#7FD1A8' }}>
                  <Text style={{ color: '#2A4A3A', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                    ✓ Already Learned
                  </Text>
                </Card>
              )}
              <View style={styles.footerActions}>
                <Button
                  variant="outline"
                  onPress={() => {
                    // Try router.back() first, fallback to explicit navigation
                    if (params.backTo === 'library') {
                      router.push('/(app)/library');
                    } else {
                      router.back();
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Back to Library
                </Button>
                <Button
                  onPress={handleLearnForm}
                  style={{ flex: 1 }}
                  disabled={isAlreadyLearned || createForm.isPending}
                >
                  {createForm.isPending ? 'Learning...' : 'Learn This Form'}
                </Button>
              </View>
            </View>
          ) : params.fromForms === 'true' ? (
            /* Form preview from Forms page - show Assume Form button */
            <View style={styles.footerActions}>
              <Button variant="outline" onPress={() => {
                // Try router.back() first, fallback to explicit navigation
                if (params.backTo === 'forms') {
                  router.push('/(app)/forms');
                } else {
                  router.back();
                }
              }} style={{ flex: 1 }}>
                Back
              </Button>
              <Button onPress={handleAssumeForm} style={{ flex: 1 }}>
                Assume This Form
              </Button>
            </View>
          ) : (
            /* Assumed form - show Revert and Switch */
            <View style={styles.footerActions}>
              <Button variant="outline" onPress={handleRevertForm} style={{ flex: 1 }}>
                Revert Form
              </Button>
              <Button onPress={handleSwitchForm} style={{ flex: 1 }}>
                Switch Form
              </Button>
            </View>
          )}

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Ability Description Modal */}
        <Modal
          visible={showAbilityModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAbilityModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowAbilityModal(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedAbility && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalCategory}>
                        {selectedAbility.category}
                      </Text>
                      <Text style={styles.modalTitle}>
                        {selectedAbility.name}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => setShowAbilityModal(false)}
                    >
                      <Text style={styles.closeButtonText}>×</Text>
                    </Pressable>
                  </View>
                  <ScrollView>
                    <Text style={styles.modalDescription}>
                      {selectedAbility.description}
                    </Text>
                  </ScrollView>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Toast Notification */}
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />
      </LivingForestBg>
    </View>
  );
}
