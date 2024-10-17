<template>
    <div>
        <div style="padding: 20px 0">
            <el-button type="primary" style="margin-right: 5px" @click="onAdd">新增</el-button>
        </div>
        <!-- <Table border :columns="columnData" :data="data">
            <template slot-scope="{ row, index }" slot="action">
                <Button type="primary" size="small" style="margin-right: 5px" @click="onEdit(row, index)">编辑</Button>
            </template>
        </Table> -->
        <el-table :data="data">
            <el-table-column label="Type" prop="type"></el-table-column>
            <el-table-column label="备注" prop="remark"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="{ row, index }">
                    <el-button type="primary" size="small" style="margin-right: 5px" @click="onEdit(row, index)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
            :visible.sync="visible"
            title="新增模板配置">
            <el-form ref="formInline" :model="formData" v-loading="loading" label-width="75px">
                <el-form-item prop="type" label="Type" required>
                    <el-input type="text" v-model="formData.type" placeholder="请填写Type"></el-input>
                </el-form-item>
                <el-form-item prop="remark" label="备注" required>
                    <el-input type="text" v-model="formData.remark" placeholder="请填写备注"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onAddTemplate">保存</el-button>
                </el-form-item>
            </el-form>
            
        </el-dialog>
    </div>
</template>

<script>
import {
//   getSettingFormTemplate,
  setSettingFormTemplate
} from '@/api/menu';

export default {
    data () {
        return {
            columnData: [
                {
                    title: 'Type',
                    key: 'type',
                },
                {
                    title: '备注',
                    key: 'remark'
                },
                {
                    title: '操作',
                    slot: 'action',
                    align: 'center'
                }
            ],
            data: [
                {
                    type: 1,
                    remark: '闸机检票配置',
                },
            ],
            visible: false,
            loading: false,
            formData: {
                type: '',
                remark: ''
            }

        }
    },
    methods: {
        onEdit(row) {
            const {type} = row;
            
            this.$router.push({
                name: 'TemplateConfig',
                query: {type}
            })
        },

        onAdd() {
            this.visible = true;
        },

        async onAddTemplate() {
            const {formData: {type, remark}, loading} = this;
            
            if(loading) return this.$message.error({background: true, message: '正在新增，请稍候'});
            this.loading = true;

            const res = await setSettingFormTemplate({type, remark, template: '[{"headerTitle":"","desc":"","child":[]}]'}).catch(e => e);

            this.loading = false;
            if(!res || res.code != 200) {
                this.$message.error({background: true, message: res && (res.message || res.msg) || '新增表单模板出错'});
                return;
            }
            this.$message.success({background: true, message: '新增表单模板成功'});
            this.$router.push({
                name: 'TemplateConfig',
                query: {type, remark}
            })
        }
    }
}
</script>

<style>

</style>