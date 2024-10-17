<template>
    <div style="border: 1px solid #ccc;">
        <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editor"
            :defaultConfig="toolbarConfig"
            :mode="mode"
        />
        <w-editor
            style="height: 300px; overflow-y: hidden;"
            v-model="html"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="onCreated"
            @onChange="onChange"
            @onDestroyed="onDestroyed"
            @onMaxLength="onMaxLength"
            @onFocus="onFocus"
            @onBlur="onBlur"
            @customAlert="customAlert"
            @customPaste="customPaste"></w-editor>
    </div>
</template>
<script>
import Vue from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { DomEditor } from '@wangeditor/editor'

export default Vue.extend({
    components: { WEditor: Editor, Toolbar },

    props: {
        value: String,
        toolbarConfig: {
            type: Object,
            default() {
                return {
                    excludeKeys: [
                        "fullScreen",
                        "|",
                        "group-image",
                        "group-video",
                        "emotion",
                        "todo"
                    ]
                }
            }
        },
        editorConfig: {
            type: Object,
            default() {
                return {
                    autoFocus: false,
                    placeholder: '请输入内容...'
                }
            }
        }
    },

    data() {
        return {
            editor: null,
            html: this.value,
            mode: 'default', // or 'simple'
        }
    },

    watch: {
        value(val) {
            console.log('editor value change', val);
            this.html = val || '';
            if( this.editor ) {
                const toolbar = DomEditor.getToolbar(this.editor)

                const curToolbarConfig = toolbar.getConfig()
                console.log( curToolbarConfig.toolbarKeys ) // 当前菜单排序和分组
                if(!val) {
                //     this.editor.setHtml(val);
                // } else {
                    this.editor.clear();
                }
            }
        }
    },

    methods: {
        onCreated(editor) {
            this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
        },
        onChange(editor) {
            console.log('onChange', editor.children) 
            console.log( editor.getHtml() );
            console.log( editor.getText() );
            const val = !editor.getText() ? '' : editor.getHtml()
            this.$emit('input', val);
            this.$emit('change', val);
        },
        onDestroyed(editor) { console.log('onDestroyed', editor) },
        onMaxLength(editor) { console.log('onMaxLength', editor) },
        onFocus(editor) { console.log('onFocus', editor) },
        onBlur(editor) { console.log('onBlur', editor) },
        customAlert(info, type) { window.alert(`${type}:\n${info}`) },
        customPaste(editor, event, callback) {
            console.log('ClipboardEvent 粘贴事件对象', event)
            // this.$message.error({
            //     background: true,
            //     message: "先不支持粘贴",
            // });
            // const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
            // const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
            // const rtf = event.clipboardData.getData('text/rtf') // 获取 rtf 数据（如从 word wsp 复制粘贴）

            // 自定义插入内容
            // editor.insertText('xxx')

            // 返回 false ，阻止默认粘贴行为
            // event.preventDefault()
            // callback(false) // 返回值（注意，vue 事件的返回值，不能用 return）

            // 返回 true ，继续默认的粘贴行为
            // callback(true)
        },
    },
    mounted() {
        // 模拟 ajax 请求，异步渲染编辑器
        setTimeout(() => {
            // this.html = this.value;
        }, 0)
    },
    beforeDestroy() {
        const editor = this.editor
        if (editor == null) return
        editor.destroy() // 组件销毁时，及时销毁编辑器
    }
})
</script>
<style src="@wangeditor/editor/dist/css/style.css"></style>