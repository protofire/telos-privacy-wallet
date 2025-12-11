const white = '#FFFFFF';
const grey = '#F4F3F8';
const darkGrey = '#DCD8EA';
const purple = '#754CFF';
const purpleLight = '#8052E0';
const purpleExtraLight = '#B96BCD';
const blue = '#1B4DEB';
const blueLight = '#1B87EB';
const blueExtraLight = '#E4EBFF';
const textNormal = '#6D6489';
const darkPurple = '#2A1B5B';
const orange = '#EF8726';
const orangeLight = '#FAE4DA';
const orangeExtraLight = '#FFFAEE';
const red = '#EF102A';
const yellow = '#FBEED0';
const black = '#000000';
const success = '#00D100';
const telosGradient = 'linear-gradient(147.39deg, #FFA1E5 16.02%, #6F9AE3 85.63%)';
const telosGradientSoft = 'linear-gradient(135deg, rgba(0, 242, 243, 0.1) 0%, rgba(79, 172, 254, 0.1) 33%, rgba(196, 113, 245, 0.1) 66%)';

// Dark Theme Colors
const darkBlack = '#121212';
const darkCard = '#1E1E24';
const darkTextPrimary = '#E0E0E0';
const darkTextSecondary = '#D5D5D5';
const darkBorder = '#333340';
const darkInput = '#252530';
const telosGradientDark = 'radial-gradient(circle at 0 120%,#8b3f98,transparent 50%),radial-gradient(circle at 100% 120%,#8b3f98,transparent 50%),radial-gradient(circle at 100% 0%,#348dcc,transparent 40%),radial-gradient(circle at 20% 0%,#73c58f,transparent 40%),#000000';
const dropdownBackgroundLight = '#FFFFFF';
const dropdownBackgroundDark = '#2D2D3A';

export const light = {
  color: {
    white,
    grey,
    darkGrey,
    purple,
    purpleLight,
    blue,
    blueLight,
    darkPurple,
    orange,
    orangeLight,
    orangeExtraLight,
    blueExtraLight,
    purpleExtraLight,
    yellow,
    black,
    telosGradient,
    telosGradientSoft,
    success,
  },
  text: {
    color: {
      primary: darkPurple,
      secondary: textNormal,
      error: red,
    },
    weight: {
      normal: 400,
      bold: 600,
      extraBold: 700,
    },
  },
  button: {
    background: telosGradientSoft,
    primary: {
      background: {
        default: black,
        disabled: 'rgba(64, 64, 64, 0.2)',
        contrast: 'rgba(64, 64, 64, 0.1)',
      },
      border: {
        color: 'rgba(149, 126, 223, 0.4)',
      },
      text: {
        color: {
          default: white,
          contrast: darkPurple,
        },
        size: {
          small: '16px',
          default: '20px',
        },
        weight: {
          small: 400,
          default: 600,
        },
      },
    },
    link: {
      text: {
        color: purple,
      },
    },
  },
  tab: {
    background: {
      default: white,
      active: orangeLight,
    },
  },
  networkLabel: {
    background: orangeExtraLight,
  },
  card: {
    background: white,
    title: {
      color: darkPurple,
    },
    note: {
      color: textNormal,
    },
  },
  input: {
    background: {
      primary: grey,
      secondary: white,
      checked: purple,
    },
    border: {
      color: {
        default: darkGrey,
        focus: blue,
        error: red,
      },
    },
    text: {
      color: {
        default: darkPurple,
        placeholder: textNormal,
      }
    },
  },
  transferInput: {
    text: {
      color: {
        default: darkPurple,
        small: textNormal,
        placeholder: textNormal,
      },
      weight: {
        default: 600,
        small: 400,
      }
    },
  },
  modal: {
    background: white,
    overlay: 'rgba(30, 45, 95, 0.9)',
  },
  walletConnectorOption: {
    background: {
      default: grey,
      hover: 'rgba(117, 76, 255, 0.1)',
    },
    border: {
      default: darkGrey,
      hover: purple,
      light: grey,
    },
  },
  warning: {
    background: 'rgba(239, 135, 38, 0.1)',
    border: orange,
    text: {
      color: orange,
    },
  },
  mnemonic: {
    background: {
      default: white,
      active: grey,
    },
    border: {
      default: darkGrey,
      active: grey,
    },
    text: {
      color: {
        default: darkPurple,
        active: darkGrey,
      },
    },
  },
  background: telosGradientSoft,
  dropdown: {
    background: dropdownBackgroundLight,
  },
  icon: {
    color: {
      default: black,
      hover: purpleExtraLight,
    }
  },
  skeleton: {
    baseColor: "#eae0df",
    highlightColor: "#c9c8cc",
  },
  lineNumbers: '#D5D5D5',
};

export const dark = {
  ...light,
  color: {
    ...light.color,
    white: darkCard,
    grey: darkBlack,
    darkGrey: darkBorder,
    black: white,
    telosGradientSoft: telosGradientDark,
  },
  text: {
    ...light.text,
    color: {
      ...light.text.color,
      primary: darkTextPrimary,
      secondary: darkTextSecondary,
      contrast: grey,
    },

  },
  button: {
    ...light.button,
    background: 'linear-gradient(0.4turn,#071033,#6039a4)',
    primary: {
      ...light.button.primary,
      border: {
        color: '#6039a4',
      },
      background: {
        ...light.button.primary.background,
        default: white,
        disabled: 'rgba(255, 255, 255, 0.2)',
      },
      text: {
        ...light.button.primary.text,
        color: {
          ...light.button.primary.text.color,
          default: black,
          contrast: grey,
        },
      },
    },
    link: {
      text: {
        color: purpleExtraLight,
      },
    },
  },
  tab: {
    background: {
      default: darkCard,
      active: '#2D2D3A',
    },
  },
  networkLabel: {
    background: '#2D2D3A',
  },
  card: {
    background: darkCard,
    title: {
      color: darkTextPrimary,
    },
    note: {
      color: darkTextSecondary,
    },
  },
  input: {
    ...light.input,
    background: {
      primary: darkInput,
      secondary: darkCard,
      checked: purple,
    },
    border: {
      ...light.input.border,
      color: {
        ...light.input.border.color,
        default: darkBorder,
      },
    },
    text: {
      color: {
        default: darkTextPrimary,
        placeholder: darkTextSecondary,
      }
    },
  },
  transferInput: {
    text: {
      ...light.transferInput.text,
      color: {
        ...light.transferInput.text.color,
        default: darkTextPrimary,
        small: darkTextSecondary,
        placeholder: darkTextSecondary,
      },
    },
  },
  modal: {
    background: darkCard,
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  walletConnectorOption: {
    background: {
      default: darkInput,
      hover: '#2D2D3A',
    },
    border: {
      default: darkBorder,
      hover: purple,
      light: darkInput,
    },
  },
  mnemonic: {
    background: {
      default: darkCard,
      active: darkInput,
    },
    border: {
      default: darkBorder,
      active: darkInput,
    },
    text: {
      color: {
        default: darkTextPrimary,
        active: darkTextSecondary,
      },
    },
  },
  background: telosGradientDark,
  dropdown: {
    background: dropdownBackgroundDark,
  },
  icon: {
    color: {
      default: white,
      hover: purpleExtraLight,
    }
  },
  skeleton: {
    baseColor: "#333340",
    highlightColor: "#454555",
  },
  lineNumbers: '#263238',
};
