<template>
    <el-row :gutter="16" class="page-template-config">
        <!-- <Col span="3" class="form-element-list">
            <h3 class="form-element-list--title">可选表单组件</h3>
            <draggable
                class="form-element-list--wrap"
                :list="formTags"
                :group="{ name: 'people', pull: 'clone', put: false }"
                :sort="false"
                :move="onMove"
            >
                <div
                    class="form-element-list--item"
                    v-for="element in formTags"
                    :key="element.value"
                >
                    {{ element.label }}
                </div>
            </draggable>
        </Col> -->

        <el-col :span="15" class="template-preview">
            <h3 class="template-preview--title" flex="main:justify">
                <span>模板页预览</span>
                <div
                    class="template-preview--add-module"
                    role="group"
                    aria-label="Basic example"
                >
                    <el-button type="primary" @click="addModule">新增模块</el-button>
                    <el-button type="primary" @click="saveConfig" style="margin-left: 10px;">保存模板</el-button>
                </div>

            </h3>
            <!-- <draggable
                class="dragArea list-group"
                :list="formTemplate"
                v-bind="dragOptions"
                group="people"
                @start="drag = true"
                @end="drag = false"
                @change="log"
            > -->
            <el-form 
                label-width="180px"
                label-position="left"
                size="small">
                <nested-draggable 
                    v-model="formTemplate"
                    :selected-module-index.sync="selectedModuleIndex"
                    :selected-form-item-index.sync="selectedFormItemIndex"
                    @add-form-element="onAddFormElement"
                />
            </el-form>
            <!-- <transition-group
                    type="transition"
                    :name="!drag ? 'flip-list' : null"
                >
                    <div
                        class="list-group-item"
                        v-for="element in list2"
                        :key="element.name"
                    >
                        {{ element.name }}
                    </div>
                </transition-group> -->
            <!-- </draggable> -->
        </el-col>

        <el-col class="form-element-config-wrap">
            <div class="form-element-config-header" flex="main:justify cross:center">
                <h3 class="form-element-config--title">{{selectedFormItemIndex === undefined ? '模块配置' : '表单元素配置(' + selectedConfig.elementTag + ')'}}</h3>
                <el-button 
                    type="error" 
                    :disabled="selectedFormItemIndex === undefined && selectedModuleIndex === undefined" 
                    @click="onDelete">
                    删除
                </el-button>
            </div>
            <form-element-config 
                ref="formElementConfig"
                :config.sync="selectedConfig" 
                :is-module="selectedModuleIndex !== undefined && selectedFormItemIndex === undefined"
                :form-template="formTemplate"
                :selected-module-index="selectedModuleIndex"
                :selected-form-item-index="selectedFormItemIndex"
                @change="onConfigChange"
                class="form-element-config-content">
            </form-element-config>
        </el-col>
        <!-- <Spin size="large" fix v-show="loading"></Spin> -->
        <!-- <rawDisplayer class="col-3" :value="list1" title="List 1" />

        <rawDisplayer class="col-3" :value="list2" title="List 2" /> -->
    </el-row>
</template>

<script>
import Vue from "vue";
import {cloneDeep} from 'lodash';
// import "element-ui/lib/theme-chalk/index.css";
// import draggable from "vuedraggable";
import nestedDraggable from "./nested-draggable";
// import formTemplate from '../machine/gate/check-mock-data';
// import {
//     Loading,
//     Form,
// } from "element-ui";
import FormElementConfig from './functional-form-element-config';
import {
  getSettingFormTemplate,
  setSettingFormTemplate
} from '@/api/menu';

// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;

const visibleRelyOnKeys = (judgeData, keys) => {
    if( judgeData && judgeData.conditions && judgeData.conditions.length ) {
        const loopValidate = (conditions = []) => {
            let bool = false;
            for(let i = 0, len = conditions.length; i < len; i++) {
                if( conditions[i].judgeType ) {
                    if( loopValidate(conditions[i].conditions) ) {
                        bool = true;
                        break;
                    }
                } else {
                    const {key} = conditions[i];

                    if( key && keys.includes(key) ) {
                        bool = true;
                        break;
                    }
                }
            }
            return bool;
        }
        return loopValidate(judgeData.conditions);
    } else {
        return false;
    }
};

export default {
    name: "TemplateConfig",
    
    components: {
        // draggable,
        nestedDraggable,
        // [Form.name]: Form,
        FormElementConfig,
    },

    props: {
        type: [String, Number],
        remark: String
    },

    data() {
        return {
            formTags: [
                { 
                    value: "ISwitch", 
                    label: "switch开关", 
                    options: {
                        key: '',
                        label: '表单项名称',
                        valueType: 'boolean', 
                        defaultValue: false,
                        visible: true, // boolean 或 对象，文档详见machine->gate->readme.MD
                        setToDefaultWhenVisibleChange: true, // 默认true
                    }
                },
                { 
                    value: "RadioGroup", 
                    label: "radio单选框组", 
                    options: {
                        attrs: {
                            type: 'button' // 按钮式/默认样式
                        },
                        key: '',
                        label: '表单项名称',
                        valueType: 'string', // 选中值的数据类型 可选值string/number/boolean
                        defaultValue: '',
                        rules: [],
                        radioGroupOptions: [
                            // { label: '海康桶式测温设备', value: 'barrelTemperatureDevice' },
                            // { label: '海康卡片测温设备', value: 'cardTemperatureDevice' },
                            // { label: '大树测温设备', value: 'dsTemperatureDevice' },
                        ],
                        visible: true, // boolean 或 对象，文档详见machine->gate->readme.MD
                        setToDefaultWhenVisibleChange: true, // 默认true
                    }
                },
                { 
                    value: "CheckboxGroup", 
                    label: "checkbox多选框组",
                    options: {
                        key: '',
                        label: '表单项名称',
                        valueType: 'Array', // 多选框组可选值Array TODO：可选值增加string
                        defaultValue: [],
                        rules: [],
                        options: [],

                    }
                },
                { 
                    value: "Input", 
                    label: "Input输入框",
                    options: {
                        key: '',
                        label: '表单项名称',
                        valueType: 'string', // 选中值的数据类型 可选值string
                        defaultValue: '',
                        attrs: {
                            placeholder: '',
                        },
                        suffix: '',
                        prefix: '',
                        rules: [],
                        visible: true,
                        setToDefaultWhenVisibleChange: true
                    }
                },
                { 
                    value: "InputNumber", 
                    label: "InputNumber数字输入框",
                    options: {
                        key: '',
                        label: '表单项名称',
                        valueType: 'number', // 选中值的数据类型 可选值number
                        defaultValue: 0,
                        attrs: {
                            placeholder: '',
                            min: 0,
                            // max: null,
                        },
                        suffix: '',
                        prefix: '',
                        rules: [],
                        visible: true,
                        setToDefaultWhenVisibleChange: true
                    }
                },
                { 
                    value: "Select", 
                    label: "Select选择器",
                    options: {
                        key: '',
                        label: '表单项名称',
                        valueType: 'string', // 选中值的数据类型 可选值string/number/boolean
                        defaultValue: '',
                        rules: [],
                        attrs: {
                            placeholder: '',
                            remote: false,
                            filterable: false,
                            clearable: false,
                        },
                        options: [],
                        customOption: false,
                        labelKey: '',
                        valueKey: '',
                        remoteOptions: {
                            url: "",
                            method: '',
                            keywordKey: '',
                            data: {
                                // 其他接口请求参数 <参数名>: {isStatic: true|false, value: isStatic为true则直接赋值，否则value为表单项的key，当前参数对应值为key对应表单项的值}
                            },
                            initData: {},
                            listeners: [],
                        },
                        visible: true,
                    }
                },
            ],
            formTemplate: [],
            // drag: false,
            selectedModuleIndex: undefined,
            selectedFormItemIndex: undefined,
        };
    },
    computed: {
        // dragOptions() {
        //     return {
        //         animation: 200,
        //         group: "description",
        //         disabled: false,
        //         ghostClass: "ghost",
        //     };
        // },
        selectedConfig: {
            get() {
                const {selectedModuleIndex, selectedFormItemIndex, formTemplate} = this;

                if(selectedModuleIndex === undefined && selectedFormItemIndex === undefined) return {};
                if(selectedFormItemIndex === undefined) {
                    return formTemplate[selectedModuleIndex] || {};
                } else {
                    const {child = []} = formTemplate[selectedModuleIndex] || {};
                    return child[selectedFormItemIndex] || {};
                }
            },
            set(val) {
                const {selectedModuleIndex, selectedFormItemIndex, formTemplate} = this;

                if(selectedModuleIndex === undefined && selectedFormItemIndex === undefined) return this.$message.error('未选中模块/表单元素');
                if(selectedFormItemIndex === undefined) {
                    const {visible, headerTitle, desc} = val;

                    this.$set(formTemplate[selectedModuleIndex], 'headerTitle', headerTitle);
                    this.$set(formTemplate[selectedModuleIndex], 'desc', desc);
                    this.$set(formTemplate[selectedModuleIndex], 'visible', visible);
                } else {
                    this.$set(formTemplate[selectedModuleIndex].child, selectedFormItemIndex, val);
                }
                // this.saveConfig();
            }
        }
    },

    provide() {
        return {
            formTags: this.formTags
        }
    },

    created() {
        this.getSettingFormTemplate().catch(e => e);
    },

    methods: {
        // onMove(e,originalEvent) {
        //     console.log('可选表单组件 onMove', e);
        //     const {
        //         draggedContext: {element: {label: dragFormElementLabel, value: dragFormElementName} = {}} = {},
        //         relatedContext: {element: {child} = {}} = {}
        //     } = e;

        //     if(!e.relatedContext.element || !e.relatedContext.element.child) return false;
        // },
        async getSettingFormTemplate() {
            // return new Promise(async (resolve, reject) => {
                const {type} = this;
                this.loading = true;
                
                const loading = this.$loading({
                    lock: true,
                    text: '正在查询表单模板',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                const res = await getSettingFormTemplate({type}).catch(e => e);

                this.loading = false;
                loading.close();
                if(!res || res.code != 200) {
                    this.$message.error({background: true, message: res && (res.message || res.msg) || '查询表单模板出错'});
                    return Promise.reject(res && (res.message || res.msg) || '查询表单模板出错');
                }
                if(!res.data || !res.data.length) {
                    this.$message.error({background: true, message: '表单模板无数据'});
                    return Promise.reject('表单模板无数据');
                }
                this.$message.success({background: true, message: '查询表单模板成功'});
                this.formTemplate = res.data || [];
                return Promise.resolve();
            // })
        },

        // 新增模块
        async addModule() {
            if(this.selectedFormItemIndex !== undefined) {
                const res = await this.$refs.formElementConfig.onSave().catch(e => e);

                if(res) return this.$message.error('当前选中表单元素配置有误，请修正后重试');
            }
            this.formTemplate.unshift({
                headerTitle: '模块标题',
                desc: "<p>模块描述</p>",
                child: []
            })
        },

        async onAddFormElement({elementTag, formModule, formModuleIndex} = {}) {
            if(this.selectedFormItemIndex !== undefined) {
                const res = await this.$refs.formElementConfig.onSave().catch(e => e);

                if(res) return this.$message.error('当前选中表单元素配置有误，请修正后重试');
            }
            const {formTags} = this;
            const config = formTags.find(item => item.value == elementTag);
            if(!config) return this.$message.error('未知表单标签名');
            if(!formModule.child) {
                this.$set(formModule, 'child', []);
            }
            formModule.child.push({
                elementTag,
                ...cloneDeep( config.options )
            });
            this.selectedModuleIndex = formModuleIndex;
            this.selectedFormItemIndex = formModule.child.length - 1;
        },

        onDelete() {
            const {
                formTemplate,
                selectedModuleIndex,
                selectedFormItemIndex,
            } = this;
            
            this.$Modal.confirm({
                message: selectedFormItemIndex === undefined ? '确定删除当前模块？' : '确定删除当前表单元素？',
                onOk: selectedFormItemIndex === undefined ? this.deleteModule.bind(this) : this.deleteFormItem.bind(this)
            })
        },

        deleteModule() {
            const {
                formTemplate,
                selectedModuleIndex,
                selectedFormItemIndex,
            } = this;
            // 当前选中模块，需判断是否有其他模块或者表单元素依赖当前选中模块的表单元素
            // 有则给提示先取消依赖再删除
            // 无则执行删除
            if( !formTemplate[selectedModuleIndex] ) return this.$message.error('未选中模块');

            const formElementKeys = (formTemplate[selectedModuleIndex].child || []).map(item => item.key);

            if(!formElementKeys.length) {
                this.formTemplate.splice(selectedModuleIndex, 1);
            } else {
                let canDelete = true;
                
                for(let i = 0, len = formTemplate.length; i < len; i ++) {
                    if( i != selectedModuleIndex ) {
                        const {child, visible} = formTemplate[i];

                        if( typeof visible !== 'boolean' ) {
                            if( visibleRelyOnKeys(visible, formElementKeys) ) {
                                canDelete = false;
                                break;
                            }
                        }
                        if(child && child.length) {
                            let j = 0, _len = child.length;

                            for(; j < _len; j++) {
                                const {visible, events = {}, remoteOptions, elementTag} = child[j];

                                if( visibleRelyOnKeys(visible, formElementKeys) ) {
                                    canDelete = false;
                                    break;
                                }
                                if( Object.values(events).some(item => item.target && formElementKeys.includes(item.target)) ) {
                                    canDelete = false;
                                    break;
                                }
                                if(elementTag == 'Select') {
                                    const {data = {}, initData = {}, listeners = []} = remoteOptions || {};

                                    if(
                                        Object.values(data).some(item => !item.isStatic && item.value && formElementKeys.includes(item.value)) ||
                                        Object.values(initData).some(item => !item.isStatic && item.value && formElementKeys.includes(item.value)) ||
                                        listeners.some(item => item && formElementKeys.includes(item))
                                    ) {
                                        canDelete = false;
                                        break;
                                    }
                                }
                            }
                            if(j < _len) break;
                        }
                    }
                }

                if( canDelete ) {
                    this.formTemplate.splice(selectedModuleIndex, 1);
                } else {
                    this.$message.error('其他模块有依赖当前模块表单元素，请先取消依赖再删除');
                }
            }
        },

        deleteFormItem() {
            const {
                formTemplate,
                selectedModuleIndex,
                selectedFormItemIndex,
            } = this;
            // 当前选中表单元素 判断是否有其他模块或者表单元素依赖当前选中的表单元素
            // 有则给提示先取消依赖再删除
            // 无则执行删除
            if( !formTemplate[selectedModuleIndex] ) return this.$message.error('未选中模块');
            if( selectedFormItemIndex === undefined ) return this.$message.error('未选中表单元素');
            if( !formTemplate[selectedModuleIndex].child || !formTemplate[selectedModuleIndex].child[selectedFormItemIndex] ) return this.$message.error('未知表单元素');

            const formElementKeys = [formTemplate[selectedModuleIndex].child[selectedFormItemIndex].key];
            let canDelete = true;
            
            for(let i = 0, len = formTemplate.length; i < len; i ++) {
                const {child, visible} = formTemplate[i];

                if( typeof visible !== 'boolean' ) {
                    if( visibleRelyOnKeys(visible, formElementKeys) ) {
                        canDelete = false;
                        break;
                    }
                }
                if(child && child.length) {
                    let j = 0, _len = child.length;

                    for(; j < _len; j++) {
                        // 非当前选中表单元素所在模块 或 非当前选中表单元素
                        if( i != selectedModuleIndex || j != selectedFormItemIndex ) {
                            const {visible, events = {}, remoteOptions, elementTag} = child[j];

                            if( visibleRelyOnKeys(visible, formElementKeys) ) {
                                canDelete = false;
                                break;
                            }
                            if( Object.values(events).some(item => item.target && formElementKeys.includes(item.target)) ) {
                                canDelete = false;
                                break;
                            }
                            if(elementTag == 'Select') {
                                const {data = {}, initData = {}, listeners = []} = remoteOptions || {};

                                if(
                                    Object.values(data).some(item => !item.isStatic && item.value && formElementKeys.includes(item.value)) ||
                                    Object.values(initData).some(item => !item.isStatic && item.value && formElementKeys.includes(item.value)) ||
                                    listeners.some(item => item && formElementKeys.includes(item))
                                ) {
                                    canDelete = false;
                                    break;
                                }
                            }
                        }
                    }
                    if(j < _len) break;
                }
            }

            if( canDelete ) {
                this.formTemplate[selectedModuleIndex].child.splice(selectedFormItemIndex, 1);
            } else {
                this.$message.error('其他模块有依赖当前模块表单元素，请先取消依赖再删除');
            }
        },

        onConfigChange(configData) {
            this.$message.success(this.selectedFormItemIndex !== undefined ? '表单元素配置数据已缓存，点击保存模板生效' : '模块配置数据已缓存，点击保存模板生效');
            console.log('on config change', configData, this.formTemplate);
        },

        async saveConfig() {
            // return new Promise(async (resolve, reject) => {
                const {formTemplate, type} = this;
                const errMsg = await this.validateFormTemplate().catch(e => e);
                console.log( errMsg );
                if(errMsg) return this.$message.error(errMsg);
                if( this.loading ) return this.$message.error('正在保存，请稍候');
                this.loading = true;
                
                const loading = this.$loading({
                    lock: true,
                    text: '正在保存',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });
                const res = await setSettingFormTemplate({
                    type, 
                    template: JSON.stringify(formTemplate),
                    remark: this.remark
                }).catch(e => e);

                this.loading = false;
                loading.close();
                if(!res || res.code != 200) {
                    this.$message.error({background: true, message: res && (res.message || res.msg) || '保存表单模板出错'});
                    return Promise.reject(res && (res.message || res.msg) || '保存表单模板出错');
                }
                // if(!res.data || !res.data.length) {
                //     this.$message.error({background: true, message: '表单模板无数据'});
                //     reject('表单模板无数据');
                //     return;
                // }
                this.$message.success({background: true, message: '保存表单模板成功'});
                return Promise.resolve();
            // })
        },
        
        // 当前只校验接口对应key是否填写
        validateFormTemplate() {
            return new Promise((resolve, reject) => {
                const {formTemplate} = this;
                let errMsg = '';
                
                for(let i = 0, len = formTemplate.length; i < len; i++) {
                    const {child = [], headerTitle} = formTemplate[i];
                    const nokeyFormItemIndex = child.findIndex(formItem => !formItem.key);

                    if( nokeyFormItemIndex > -1 ) {
                        errMsg = `第${i+1}个模块${headerTitle ? '(模块名称' + headerTitle + ')' : ''}第${nokeyFormItemIndex+1}个表单元素${child[nokeyFormItemIndex].label ? '(表单元素标签文本为' + child[nokeyFormItemIndex].label + ')' : ''}未配置接口对应key`;
                        break;
                    }
                }
                resolve(errMsg);
            })
        },
    },
};
</script>
<style scoped lang="scss">
@import '~@/vars.scss';
.page-template-config {
    /deep/ .form-el-width-180 {
        width: 180px;
    }
    /deep/ .form-el-width-125 {
        width: 125px;
    }
    /deep/ .form-el-width-100 {
        width: 100px;
    }
}
.form-element-list {
    &--title {
        padding: 10px 8px;
        background-color: #f0f3f5;
    }
    &--wrap {
        padding: 10px 0;
        border: 1px solid #e9e9eb;
    }
    &--item {
        padding: 4px 8px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
            background-color: $borderColorLter;
            color: $colorPrimary;
        }
    }
    &--item + &--item {
        margin-top: 8px;
    }
}
.template-preview {
    &--title {
        padding: 10px 8px;
        background-color: #f0f3f5;
    }
    &--add-module {

    }
}
.form-element-config {
    &-wrap {
        position:fixed;
        right: 8px;
        top: 131px;
        bottom: 8px;
        width: calc((100% - 200px)*0.375);
        // overflow: auto;
        display: flex;
        flex-direction: column;
    }

    &-header {
        padding: 10px 8px;
        background-color: #f0f3f5;
    }
    &-content {
        flex-grow: 1;
        margin-top: 20px;
        overflow: auto;

        /deep/ .el-form-item--mini .el-form-item__content, 
        /deep/ .el-form-item--mini .el-form-item__label {
            font-size: 12px;
        }

        /deep/ .sub-form {
            position: relative;
            margin-top: 10px;
            padding: 10px 0 10px 10px;
            background-color: #f0f3f5;

            &-inner {
                position: relative;
                margin-top: 10px;
                padding: 10px 0;
                background-color: #f0f3f5;
            }

            .el-form-item--mini:last-child {
                margin-bottom: 0;
            }
        }
        /deep/ .el-icon-error {
            // margin-top: 8px;
            margin-left: 5px;
            cursor: pointer;
        }

        &::-webkit-scrollbar {
            width: 8px;
        }
        &::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background-color: rgba(0,0,0,.2);
        }
        &::-webkit-scrollbar-track {
            width: 8px;
        }
    }
}
.flip-list-move {
    transition: transform 0.5s;
}
.no-move {
    transition: transform 0s;
}
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
.list-group {
    min-height: 20px;
}
.list-group-item {
    cursor: move;
}
.list-group-item i {
    cursor: pointer;
}
</style>
<style lang="scss">
@import '~@/vars.scss';
.ivu-layout-content {
    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-thumb {
        border-radius: 8px;
        background-color: rgba(0,0,0,.2);
    }
    &::-webkit-scrollbar-track {
        width: 8px;
    }
}
.c-info {
    color: $colorInfo;
}
.c-danger {
    color: $colorDanger;
}
.mt10 {
    margin-top: 10px;
}
</style>