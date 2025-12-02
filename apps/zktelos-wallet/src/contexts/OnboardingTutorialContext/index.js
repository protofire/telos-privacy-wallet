import React, { createContext, useEffect, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Shepherd from 'shepherd.js';
import { useTranslation } from 'react-i18next';

import 'shepherd.js/dist/css/shepherd.css';
import '../../styles/onboarding-tutorial.css';


const OnboardingTutorialContext = createContext();

const tourOptions = {
  useModalOverlay: true,
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    classes: 'custom-shepherd-theme',
    scrollTo: { behavior: 'smooth', block: 'center' },
  },
};

const createSteps = (t) => [
  {
    id: 'create-zkaccount',
    title: t('onboardingTutorial.steps.createZkAccount.title'),
    text: `
    <div>
      <p>${t('onboardingTutorial.steps.createZkAccount.content.paragraph1')}</p>
      <p>${t('onboardingTutorial.steps.createZkAccount.content.paragraph2')}</p>
      <p>${t('onboardingTutorial.steps.createZkAccount.content.paragraph3')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="create-zkaccount"]',
      on: 'bottom'
    },
    extraHighlights: ['.create-zkaccount'],
    buttons: [
      {
        text: t('onboardingTutorial.buttons.next'),
        action() {
          return this.next();
        }
      }
    ]
  },
  {
    id: 'supported-tokens',
    title: t('onboardingTutorial.steps.supportedTokens.title'),
    text: `<div class="supported-tokens-content">
      <p>${t('onboardingTutorial.steps.supportedTokens.content.paragraph1')}</p>
      <p>${t('onboardingTutorial.steps.supportedTokens.content.paragraph2')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="supported-tokens"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: t('onboardingTutorial.buttons.back'),
        classes: 'shepherd-button-secondary',
        action() {
          return this.back();
        }
      },
      {
        text: t('onboardingTutorial.buttons.next'),
        action() {
          return this.next();
        }
      }
    ]
  },
  {
    id: 'home-overview',
    title: t('onboardingTutorial.steps.homeOverview.title'),
    text: `<div class="home-overview-content">
      <p>${t('onboardingTutorial.steps.homeOverview.content.paragraph1')}</p>
      <p>${t('onboardingTutorial.steps.homeOverview.content.paragraph2')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="home-overview"]',
      on: 'top'
    },
    buttons: [
      {
        text: t('onboardingTutorial.buttons.back'),
        classes: 'shepherd-button-secondary',
        action() {
          return this.back();
        }
      },
      {
        text: t('onboardingTutorial.buttons.next'),
        action() {
          return this.next();
        }
      }
    ]
  },
  {
    id: 'deposit',
    title: t('onboardingTutorial.steps.deposit.title'),
    text: `<div class="deposit-content">
    <p>${t('onboardingTutorial.steps.deposit.content.paragraph1')}</p>
    <p>${t('onboardingTutorial.steps.deposit.content.paragraph2')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="deposit-tab"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: t('onboardingTutorial.buttons.back'),
        classes: 'shepherd-button-secondary',
        action() {
          return this.back();
        }
      },
      {
        text: t('onboardingTutorial.buttons.next'),
        action() {
          return this.next();
        }
      }
    ]
  },
  {
    id: 'withdraw',
    title: t('onboardingTutorial.steps.withdraw.title'),
    text: `<div class="withdraw-content">
    <p>${t('onboardingTutorial.steps.withdraw.content.paragraph1')}</p>
    <p>${t('onboardingTutorial.steps.withdraw.content.paragraph2')}</p>
    <p>${t('onboardingTutorial.steps.withdraw.content.paragraph3')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="withdraw-tab"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: t('onboardingTutorial.buttons.back'),
        classes: 'shepherd-button-secondary',
        action() {
          return this.back();
        }
      },
      {
        text: t('onboardingTutorial.buttons.next'),
        action() {
          return this.next();
        }
      }
    ]
  },
  {
    id: 'transfer',
    title: t('onboardingTutorial.steps.transfer.title'),
    text: `<div class="transfer-content">
    <p>${t('onboardingTutorial.steps.transfer.content.paragraph1')}</p>
    <p>${t('onboardingTutorial.steps.transfer.content.paragraph2')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="transfer-tab"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: t('onboardingTutorial.buttons.back'),
        classes: 'shepherd-button-secondary',
        action() {
          return this.back();
        }
      },
      {
        text: t('onboardingTutorial.buttons.next'),
        action() {
          return this.next();
        }
      }
    ]
  },
  {
    id: 'history',
    title: t('onboardingTutorial.steps.history.title'),
    text: `<div class="history-content">
    <p>${t('onboardingTutorial.steps.history.content.paragraph1')}</p>
    <p>${t('onboardingTutorial.steps.history.content.paragraph2')}</p>
    </div>`,
    attachTo: {
      element: '[data-tour="history-tab"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: t('onboardingTutorial.buttons.back'),
        classes: 'shepherd-button-secondary',
        action() {
          return this.back();
        }
      },
      {
        text: t('onboardingTutorial.buttons.finishTour'),
        action() {
          return this.complete();
        }
      }
    ]
  }
];

export const OnboardingTutorialProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  const shepherdTourInstance = useMemo(() => new Shepherd.Tour(tourOptions), []);

  const handleTourEnd = useCallback(() => {
    history.push('/home');
  }, [history]);

  useEffect(() => {
    if (shepherdTourInstance.isActive()) {
      shepherdTourInstance.complete();
    }

    shepherdTourInstance.off('complete', handleTourEnd);
    shepherdTourInstance.off('cancel', handleTourEnd);

    shepherdTourInstance.steps = [];
    const steps = createSteps(t);
    shepherdTourInstance.addSteps(steps);

    shepherdTourInstance.on('complete', handleTourEnd);
    shepherdTourInstance.on('cancel', handleTourEnd);

    return () => {
      shepherdTourInstance.off('complete', handleTourEnd);
      shepherdTourInstance.off('cancel', handleTourEnd);
      if (shepherdTourInstance.isActive()) {
        shepherdTourInstance.complete();
      }
    };
  }, [i18n.language, shepherdTourInstance, handleTourEnd, t]);



  const startTour = () => {
    shepherdTourInstance.start();
  };


  const tourWithExtras = {
    ...shepherdTourInstance,
    startTour,
    completeTour: handleTourEnd
  };

  return (
    <OnboardingTutorialContext.Provider value={tourWithExtras}>
      {children}
    </OnboardingTutorialContext.Provider>
  );
};

export default OnboardingTutorialContext;