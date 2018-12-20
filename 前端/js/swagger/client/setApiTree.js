window.onload = function() {
    // 默认的JSON文件
    var jsonDefault = 'http://petstore.swagger.io/v2/swagger.json';

    var $jsonSearchInput = $('.download-url-input');

    var isEdit = $('#swagger-editor').length;

    setTimeout(function() {
        $('.topbar-wrapper a.link').attr('href', 'javascript:;');

        $('.download-url-input').css({
            cursor: 'not-allowed',
            backgroundColor: '#f2f2f2'
        }).prop('readonly', true);
    }, 100);

    $(document)
        .on('click', '.topbar-wrapper a.link', function(e) {
            e.preventDefault();

            var $apiTree = $('.api-tree');

            if ($apiTree.is(':visible')) {
                $apiTree.slideUp();
            } else {
                $apiTree.slideDown();
            }
        })
        .on('mouseenter', '.topbar-wrapper a.link', function(e) {
            layer.tips('点击展开/收起树形菜单（Alt+C）', this, {
                tips: [1, '#555']
            });
        })
        .on('mouseleave', '.topbar-wrapper a.link', function(e) {
            layer.closeAll('tips');
        })
        .on('keyup', function(e) {
            if (e.altKey && e.keyCode === 67) {
                $('.topbar-wrapper a.link').trigger('click');
            }
        })
        .on('click', '.btn-save-api', function(e) {
            var path = $(this).attr('data-path');
            var data = editor.specSelectors.specStr();

            if (!path) {
                console.log('no path');
            }

            $.post('/saveApi', {
                path: path,
                data: data
            }).done(function(rs) {
                rs = typeof rs === 'string' ? JSON.parse(rs) : rs;

                if (rs.code == 200) {
                    layer.msg('保存成功');
                } else {
                    layer.msg(rs.msg || '保存失败');
                }
            }).fail(function() {
                layer.msg('保存失败');
            });
        })
        .on('mouseover', '.api-tree.layui-tree li', function(e) {
            e.stopPropagation();

            var $this = $(this),
                $op = $this.children('.api-op-banner');

            $('.fa-ellipsis-v').addClass('icon-hidden');

            $op.find('.fa-ellipsis-v').removeClass('icon-hidden');
        })
        .on('mouseleave', '.api-tree.layui-tree li', function(e) {
            e.stopPropagation();

            var $this = $(this),
                $op = $this.children('.api-op-banner');

            $op.find('.fa-ellipsis-v').addClass('icon-hidden');
            $op.find('.api-op-list').fadeOut(200);
        })
        .on('click', '.api-op-banner i.fa', function() {
            var $this = $(this),
                type = $this.attr('data-type'),
                $li = $this.closest('li'),
                isPosting = false;

            function getNodeTreeInfo() {
                var $li = $this.closest('li'),
                    fileName = $li.children('a').find('cite').html(),
                    isDir = fileName.indexOf('.') === -1,
                    nodeInfo = [fileName],
                    $parent = $li.closest('ul');

                while ($parent.length) {
                    $a = $parent.siblings('a');
                    nodeInfo.unshift($a.find('cite').html());

                    $parent = $a.closest('ul');
                }

                nodeInfo = nodeInfo.slice(1);

                return {
                    isDir: isDir,
                    nodeInfo: nodeInfo
                };
            }

            if (type === 'menu') {
                if ($this.siblings('.api-op-list').is(':visible')) {
                    $this.siblings('.api-op-list').fadeOut(200);
                } else {
                    $this.siblings('.api-op-list').fadeIn(200);
                }
            }
            else if (type === 'remove') {
                var nodeTreeInfo = getNodeTreeInfo();
                var msg = '';

                if (nodeTreeInfo.isDir) {
                    msg = '确定删除 <strong>' + nodeTreeInfo.nodeInfo.join('/') + '</strong> 这个目录吗？';
                } else {
                    msg = '确定删除 <strong>' + nodeTreeInfo.nodeInfo.join('/') + '</strong> 这个文件吗？';
                }

                layer.confirm(msg, function(index) {
                    if (isPosting) {
                        return;
                    }

                    isPosting = true;

                    $.post('/changeFile', {
                        type: 'remove',
                        isDir: nodeTreeInfo.isDir,
                        oldName: nodeTreeInfo.nodeInfo.join('/'),
                        newName: nodeTreeInfo.nodeInfo.join('/')
                    }).done(function(rs) {
                        isPosting = false;

                        rs = typeof rs === 'string' ? JSON.parse(rs) : rs;

                        if (rs.code == 200) {
                            layer.msg('操作成功');
                            layer.close(index);
                            ajaxGetApiTree();
                        } else {
                            layer.msg(rs.msg || '操作失败');
                        }
                    }).fail(function() {
                        isPosting = false;
                        layer.msg('操作失败');
                    });
                });
            } else {
                var nodeTreeInfo = getNodeTreeInfo();
                var msg = '';
                var title = '';
                var placeholder = '';

                if (nodeTreeInfo.isDir) {
                    if (type === 'addFolder' || type === 'addFile') {
                        title = '新建';
                        msg = '在目录 <strong>' + nodeTreeInfo.nodeInfo.join('/') + '</strong> 下新建这个';

                        if (type === 'addFile') {
                            title += '文件';
                            msg += '文件';
                        } else {
                            title += '目录';
                            msg += '目录';
                        }
                    } else if (type === 'rename') {
                        title = '编辑目录';
                        msg = '重命名 <strong>' + nodeTreeInfo.nodeInfo.join('/') + '</strong> 这个目录';
                    }
                } else {
                    if (type === 'rename') {
                        title = '编辑文件';
                        msg = '重命名 <strong>' + nodeTreeInfo.nodeInfo.join('/') + '</strong> 这个文件';
                    }
                }

                layer.prompt({
                    formType: 0,
                    value: type === 'rename' ? nodeTreeInfo.nodeInfo[nodeTreeInfo.nodeInfo.length - 1] : '',
                    title: title,
                    success: function($layero) { //    \ / | : * ? ' " < >   .
                        $layero.find('input').attr('placeholder', type === 'rename' ? nodeTreeInfo.nodeInfo[nodeTreeInfo.nodeInfo.length - 1] : '')
                            .before('<p style="margin-bottom:15px;">' + msg + '</p>');
                    }
                }, function(value, index, elem) {
                    if (isPosting) {
                        return;
                    }

                    isPosting = true;

                    value = $.trim(value);

                    if (!value) {
                        elem.val('').focus();
                        return;
                    }

                    if (type === 'addFolder' || (type === 'rename' && nodeTreeInfo.isDir)) {
                        if (/[\\\/\|:\*\?'"<>\.]/.test(value)) {
                            layer.msg('目录名不能包含 \\ / | : * ? \' " < > .');
                            return;
                        }
                    } else {
                        if (/[\\\/\|:\*\?'"<>]/.test(value)) {
                            layer.msg('文件名不能包含 \\ / | : * ? \' " < >');
                            return;
                        }

                        if (value.indexOf('.') === -1) {
                            layer.msg('请输入文件后缀');
                            return;
                        }
                    }

                    // 不能重名
                    var newNameIsOk = true;

                    if (type === 'rename') {
                        $li.siblings('li').each(function() {
                            if ($(this).children('a').find('cite').html() === value) {
                                newNameIsOk = false;
                                return false;
                            }
                        });
                    } else {
                        $li.children('ul').find('li').each(function() {
                            if ($(this).children('a').find('cite').html() === value) {
                                newNameIsOk = false;
                                return false;
                            }
                        });
                    }

                    if (!newNameIsOk) {
                        layer.msg('名称不能重复');
                        return;
                    }


                    var newName = nodeTreeInfo.nodeInfo;
                    var oldName = newName.join('/');

                    // 重命名
                    if (type === 'rename') {
                        newName = newName.slice(0, newName.length - 1);
                    }

                    newName.push(value);
                    newName = newName.join('/');

                    if (type === 'addFolder') {
                        newName += '/';
                    }

                    $.post('/changeFile', {
                        type: type,
                        isDir: nodeTreeInfo.isDir,
                        newName: newName,
                        oldName: oldName
                    }).done(function(rs) {
                        isPosting = false;

                        rs = typeof rs === 'string' ? JSON.parse(rs) : rs;

                        if (rs.code == 200) {
                            layer.msg('操作成功');
                            layer.close(index);
                            ajaxGetApiTree();
                        } else {
                            layer.msg(rs.msg || '操作失败');
                        }
                    }).fail(function() {
                        isPosting = false;
                        layer.msg('操作失败');
                    });
                });

            }

        }).on('keyup', function(e) {
            if (e.keyCode === 13 && $(document.activeElement).is('.layui-layer-input')) {
                $('.layui-layer-btn0').trigger('click')
            }
        });

    window.addEventListener('popstate', function() {
        var state = history.state;

                var activeTreeIndex = 0;
                var $activeTreeDom = $('.layui-tree.api-tree');
                var jsonPath = state.jsonPath;

                while (activeTreeIndex < jsonPath.length - 1) {
                    var $cite = $activeTreeDom.children('li').find('cite').filter(function() {
                        return $(this).text() === jsonPath[activeTreeIndex];
                    });

                    $activeTreeDom = $cite.closest('a').siblings('ul');
                    activeTreeIndex++;
                }

                $activeTreeDom.find('cite').filter(function() {
                        return $(this).text() === jsonPath[activeTreeIndex];
                    }).trigger('click');

    });

    ajaxGetApiTree();

    function ajaxGetApiTree() {
        $.get('/getApiTree').done(function(rs) {
            rs = typeof rs === 'string' ? JSON.parse(rs) : rs;

            var jsonPath = getUrlParam('jsonPath');

            jsonPath = jsonPath ? jsonPath.split('|') : '';

            var jsonPathIndex = 0;

            function setSpread(list) {
                if (jsonPathIndex > jsonPath.length) {
                    return;
                }

                var re = list.filter(function(item) {
                    return item.name === jsonPath[jsonPathIndex] && item.children;
                });

                if (!re.length) {
                    return;
                }

                re[0].spread = 1;

                jsonPathIndex++;

                setSpread(re[0].children);
            }

            if (jsonPath.length) {
                if (rs.length) {
                    rs[0].spread = 1;
                    setSpread(rs[0].children);
                } else {
                    setSpread(rs);
                }
            }

            var $swagger = isEdit ? $('#swagger-editor') : $('#swagger-ui');
            $swagger.siblings('.api-tree').remove();
            $swagger.after('<div class="api-tree">');

            layui.use('tree', function() {
                layui.tree({
                    elem: '.api-tree',
                    nodes: rs,
                    click: function(node, elem) {
                        // $(elem).trigger('dblclick');

                        // 点击文件
                        if (!node.children) {
                            var nodeInfo = [node.name],
                                nodePathName = '/api/',
                                $a = $(elem),
                                $parent = $a.closest('ul');

                            $('.layui-tree.api-tree a').removeClass('tree-item-active');
                            $a.addClass('tree-item-active');


                            while ($parent.length) {
                                $a = $parent.siblings('a');
                                nodeInfo.unshift($a.find('cite').html());

                                $parent = $a.closest('ul');
                            }

                            nodeInfo = nodeInfo.slice(1);

                            nodePathName+= nodeInfo.join('/');

                            $jsonSearchInput.val(nodePathName);


                            if (isEdit) {
                                $('.btn-view-api').attr('href', '/viewer/?jsonPath=' + encodeURIComponent(nodePathName.replace('/api/', '').replace(/\//g, '|')));
                                $('.btn-save-api').attr('data-path', nodePathName.replace('/api/', '').replace('?jsonPath=', ''));
                                editor.specActions.updateUrl(nodePathName);
                                editor.specActions.download(nodePathName);
                            } else {
                                $('.btn-edit-api').attr('href', '/editor/?jsonPath=' + encodeURIComponent(nodePathName.replace('/api/', '').replace(/\//g, '|')));
                                ui.specActions.updateUrl(nodePathName);
                                ui.specActions.download(nodePathName);

                                $('.download-url-input').css({
                                    cursor: 'not-allowed',
                                    backgroundColor: '#f2f2f2'
                                }).prop('readonly', true);
                            }


                            var newHref = location.href
                                    .replace(location.search, '?jsonPath=' + encodeURIComponent(nodeInfo.join('|')))
                                    .replace(/#.*/, '');

                            history.pushState({
                                jsonPath: nodeInfo
                            }, document.title, newHref);
                        }
                    }
                });

                setTreeOperation();

                function setTreeOperation() {
                    $('.api-tree.layui-tree li').each(function() {
                        if (!$(this).closest('ul').length) {
                            return;
                        }

                        var $this = $(this).children('a'),
                            $folder = '<i class="fa fa-folder" title="添加目录" data-type="addFolder"></i>',
                            $file = '<i class="fa fa-file" title="添加文件" data-type="addFile"></i>',
                            $edit = '<i class="fa fa-edit" title="重命名" data-type="rename"></i>',
                            $close = '<i class="fa fa-close" title="删除" data-type="remove"></i>',
                            $ellipsis = '<i class="fa fa-ellipsis-v icon-hidden" title="操作" data-type="menu"></i>'
                            $op = $('<span class="api-op-banner"><span class="api-op-list"></span></span>');

                        $op.append($ellipsis);

                        // 有子集的目录
                        if ($this.siblings('ul').length) {
                            $op.find('.api-op-list').append($folder).append($file).append($edit).append($close);
                        } else {
                            // 没子集的目录  按找.来标识是否为文件
                            if ($this.find('cite').html().indexOf('.') === -1) {
                                $op.find('.api-op-list').append($folder).append($file).append($edit).append($close);
                            } else {
                                // 文件
                                $op.find('.api-op-list').append($edit).append($close);
                            }
                        }

                        $this.after($op);
                    });
                }

                if (jsonPath.length) {
                    var jsonFileName = jsonPath[jsonPath.length - 1];

                    buildSwagger('/api/' + jsonPath.join('/'));

                    var activeTreeIndex = 0;
                    var $activeTreeDom = $('.layui-tree.api-tree');

                    while (activeTreeIndex < jsonPath.length - 1) {
                        var $cite = $activeTreeDom.children('li').find('cite').filter(function() {
                            return $(this).text() === jsonPath[activeTreeIndex];
                        });

                        $activeTreeDom = $cite.closest('a').siblings('ul');
                        activeTreeIndex++;
                    }

                    $activeTreeDom.find('cite').filter(function() {
                            return $(this).text() === jsonPath[activeTreeIndex];
                        })
                        .closest('a').addClass('tree-item-active');
                } else {
                    buildSwagger();
                }
            });
        });
    }


    setTimeout(function() {
    }, 1000);

    // buildSwagger();

    function buildSwagger(jsonFileName) {
        var href = '?jsonPath=' + encodeURIComponent((jsonFileName || jsonDefault).replace('/api/', '').replace(/\//g, '|'));

        if (isEdit) {
            var editor = SwaggerEditorBundle({
                url: jsonFileName || jsonDefault,
                dom_id: '#swagger-editor',
                layout: 'StandaloneLayout',
                presets: [
                    SwaggerEditorStandalonePreset
                ]
            });

            window.editor = editor;

            $('.topbar-wrapper a').after('<a href="/viewer/' + href + '" class="btn-view-api" target="_blank">查看</a>')
                .after('<a href="javascript:;" data-path="' + (jsonFileName || jsonDefault).replace('/api/', '') + '" class="btn-save-api" target="_blank">保存</a>');

            return;
        }

        // Build a nametem
        var ui = SwaggerUIBundle({
            url: jsonFileName || jsonDefault,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
        });

        window.ui = ui;

        $('.topbar-wrapper a').after('<a href="/editor/' + href + '" class="btn-edit-api" target="_blank">编辑</a>');
    }

    function getUrlParam(name) {
        var value = window.location.search.match(new RegExp('[?&]' + name + '=([^&]*)(&?)', 'i'));
        return value ? decodeURIComponent(value[1]) : '';
    }


    // function addSystemSelect(data) {
    //     var optionDefault = '<option value="">请选择</option>',
    //         $topbar = $('.topbar-wrapper a'),
    //         $jsonSearchBtn = $('.download-url-button'),
    //         $jsonSearchInput = $('.download-url-input'),
    //         $sysSelect = $('<select class="sys-select"></select>'),
    //         $jsonSelect = $('<select class="json-select"></select>');

    //     $topbar.after($sysSelect.append(getOptions(data)));

    //     $sysSelect.after($jsonSelect.append(optionDefault));

    //     function getOptions(list) {
    //         var options = [optionDefault];

    //         for (var i = 0; i < list.length; ++i) {
    //             options.push('<option value="' + list[i].id + '">' + list[i].name + '</option>');
    //         }

    //         return options.join('');
    //     }

    //     $sysSelect.change(function() {
    //         var sysID = this.value,
    //             sys = data.filter(function(item) {
    //                 return item.id === sysID;
    //             });

    //         $jsonSearchInput.val(jsonDefault);
    //         ui.specActions.updateUrl(jsonDefault);
    //         ui.specActions.download(jsonDefault);

    //         if (!sys.length) {
    //             $jsonSelect.html(optionDefault);
    //             return;
    //         }

    //         $jsonSelect.html(getOptions(sys[0].json));
    //     });

    //     $jsonSelect.change(function() {
    //         var sysID = this.value,
    //             url = $(this).find('option:selected').html();

    //         if (!sysID) {
    //             url = jsonDefault;
    //         }

    //         $jsonSearchInput.val(url);
    //         ui.specActions.updateUrl(url);
    //         ui.specActions.download(url);
    //     });

    //     if (curSysID) {
    //         $sysSelect.val(curSysID).trigger('change');
    //     }

    //     if (curJsonID) {
    //         $jsonSelect.val(curJsonID).trigger('change');
    //     }
    // }
};
