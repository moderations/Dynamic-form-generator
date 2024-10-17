const comps = require.context('./form-element-config', false, /\.(vue|js$)/);
const components = comps.keys().reduce((o, key) => {
    const comp = comps(key).default;

    o[comp.name] = comp;
    return o;
}, {});

export default {
    functional: true,
    render(h, context) {
        if( context.props.isModule ) {
            return h(components['FormModule'], context.data, context.children);
        }
        const {elementTag} = context.props.config;
        const comp = components[elementTag];

        if(!comp) return h('div', {
            style: {
                padding: '10px'
            }
        }, '请选择模块/表单元素');
        return h(comp, context.data, context.children);
    }
}
