module.exports = async () => {
    const [
        { default: postcssPresetEnv },
        { default: postcssNested },
        { default: postcssNormalize },
        { default: autoprefixer },
    ] = await Promise.all([
        import('postcss-preset-env'),
        import('postcss-nested'),
        import('postcss-normalize'),
        import('autoprefixer'),
    ]);

    return {
        plugins: [
            postcssPresetEnv,
            postcssNested,
            postcssNormalize,
            autoprefixer,
        ],
    };
};
