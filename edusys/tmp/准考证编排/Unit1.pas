unit Unit1;

interface

uses
  Windows, Messages, SysUtils, Variants, Classes, Graphics, Controls, Forms,
  Dialogs, DB, ADODB, StdCtrls, ExtCtrls, Grids, DBGrids, DBCtrls, ComCtrls,
    IniFiles,
  comobj;

type
  TForm1 = class(TForm)
    con1: TADOConnection;
    ds1: TDataSource;
    pnl1: TPanel;
    cbb1: TComboBox;
    btn1: TButton;
    qry1: TADOQuery;
    cbb2: TComboBox;
    pnl2: TPanel;
    DBGrid1: TDBGrid;
    dbnvgr1: TDBNavigator;
    pnl3: TPanel;
    DBGrid2: TDBGrid;
    dbnvgr2: TDBNavigator;
    btn2: TButton;
    btn3: TButton;
    btn4: TButton;
    edt1: TEdit;
    qry2: TADOQuery;
    pb1: TProgressBar;
    btn5: TButton;
    dlgOpen1: TOpenDialog;
    edt2: TEdit;
    btn6: TButton;
    btn7: TButton;
    btn8: TButton;
    btn9: TButton;
    btn10: TButton;
    btn11: TButton;
    btn12: TButton;
    btn13: TButton;
    btn14: TButton;
    btn15: TButton;
    lbl1: TLabel;
    rg1: TRadioGroup;
    mmo1: TMemo;
    chk1: TCheckBox;
    btn16: TButton;
    procedure btn1Click(Sender: TObject);
    procedure btn2Click(Sender: TObject);
    procedure cbb1Change(Sender: TObject);
    procedure cbb2Change(Sender: TObject);
    procedure btn3Click(Sender: TObject);
    procedure FormShow(Sender: TObject);
    procedure btn4Click(Sender: TObject);
    procedure btn5Click(Sender: TObject);
    procedure btn6Click(Sender: TObject);
    procedure btn8Click(Sender: TObject);
    procedure btn9Click(Sender: TObject);
    procedure btn10Click(Sender: TObject);
    procedure btn11Click(Sender: TObject);
    procedure btn12Click(Sender: TObject);
    procedure btn13Click(Sender: TObject);
    procedure btn14Click(Sender: TObject);
    procedure btn15Click(Sender: TObject);
    procedure FormClose(Sender: TObject; var Action: TCloseAction);
    procedure btn16Click(Sender: TObject);
    procedure btn7Click(Sender: TObject);

  private
    function ExportToExcel(mb: string; qsks, jsks: Integer): Boolean;
    { Private declarations }
  public

    { Public declarations }
  end;

var
  Form1: TForm1;

  njid, nj, rxnf: string;
  km: array[1..7] of string = ('外语', '物理', '历史', '化学', '生物', '政治',
    '地理');
  school: array[1..2] of string;
implementation

{$R *.dfm}

procedure qry1select(sqlstr: string);
begin
  with Form1.qry1 do
  begin
    Close;
    SQL.Clear;
    SQL.Add(sqlstr);
    Open;
  end;
end;

procedure TForm1.btn1Click(Sender: TObject);
begin
  pnl2.Visible := true;
  pnl3.Visible := false;
  qry1select('select * from 学生信息表 where 年级=''' + nj + ''' and 入学年份='
    + rxnf + ' and (学籍辅号 like ''%' + edt2.Text + '%'' or 姓名 like ''%' +
    edt2.Text + '%'' )  order by 班级,座号');
end;

procedure TForm1.btn2Click(Sender: TObject);
begin
  pnl2.Visible := false;
  pnl3.Visible := true;
  with qry1 do
  begin

    Close;
    SQL.Clear;
    SQL.Add('select * from 考场设置 where  年级代号=' + njid + ' and 入学年份='
      + rxnf + ' order by 科目代号,学校代号,开始考场');
    Open;

  end;
end;

procedure TForm1.cbb1Change(Sender: TObject);
begin
  njid := IntToStr(cbb1.ItemIndex);
  rxnf := cbb2.Text;
  nj := cbb1.Text;

end;

procedure TForm1.cbb2Change(Sender: TObject);
begin
  njid := IntToStr(cbb1.ItemIndex);
  rxnf := cbb2.Text;
  nj := cbb1.Text;
end;

procedure TForm1.btn3Click(Sender: TObject);
var
  rs7001, rs7035: integer;
  i: Integer;
begin

  pnl2.Visible := false;
  pnl3.Visible := true;
  with qry1 do
  begin

    Close;
    SQL.Clear;
    SQL.Add('select 学校代号,count(*) from 学生信息表 where  年级代号=' + njid +
      ' and 入学年份=' + rxnf + ' and 在校生=1 group by 学校代号 ');
    Open;
    rs7001 := Fields[1].AsInteger;
    if recordcount > 1 then
      qry1.Next;
    rs7035 := Fields[1].AsInteger;
    close;
    SQL.Clear;
    sql.Add('update 考场设置 set 总人数=' + inttostr(rs7001) +
      ',容纳人数=(结束考场-开始考场+1)*(考场人数-起始座号+1) where  年级代号=' + njid + ' and 入学年份=' + rxnf +
      ' and 科目代号=1 and 学校代号=7001');
    Prepared;
    ExecSQL;
    close;
    SQL.Clear;
    sql.Add('update 考场设置 set 总人数=' + inttostr(rs7035) +
      ',容纳人数=(结束考场-开始考场+1)*(考场人数-起始座号+1) where  年级代号=' + njid + ' and 入学年份=' + rxnf +
      ' and 科目代号=1 and 学校代号=7035');
    Prepared;
    ExecSQL;
    for i := 2 to 7 do
    begin
      Close;
      SQL.Clear;
      SQL.Add('select 学校代号,count(*) from 学生信息表 where  年级代号=' + njid
        + ' and 入学年份=' + rxnf + ' and 选考科目 like ''%' + km[i] +
        '%'' and 在校生=1 group by 学校代号 ');
      Open;
      rs7001 := Fields[1].AsInteger;
      if recordcount > 1 then
        qry1.Next;
      rs7035 := Fields[1].AsInteger;
      close;
      SQL.Clear;
      sql.Add('update 考场设置 set 总人数=' + inttostr(rs7001) +
        ',容纳人数=(结束考场-开始考场+1)*(考场人数-起始座号+1) where  年级代号=' + njid + ' and 入学年份=' + rxnf + ' and 科目代号='
        +
        inttostr(i) + ' and 学校代号=7001');
      Prepared;
      ExecSQL;
      close;
      SQL.Clear;
      sql.Add('update 考场设置 set 总人数=' + inttostr(rs7035) +
        ',容纳人数=(结束考场-开始考场+1)*(考场人数-起始座号+1) where  年级代号=' + njid + ' and 入学年份=' + rxnf + ' and 科目代号='
        +
        inttostr(i) + ' and 学校代号=7035');
      Prepared;
      ExecSQL;
    end;

  end;
  btn2Click(nil);
end;

procedure TForm1.FormShow(Sender: TObject);
var
  apppath: string;
  filename: string;
  myinifile: TIniFile;
begin

  apppath := ExtractFilePath(Application.ExeName);
  Filename := apppath + '参数/参数.ini';
    //指明路径.如果不指明路径.文件将在windows目录建立
  myinifile := Tinifile.Create(Filename); //Create('program.ini');
  school[1] := myinifile.ReadString('基本信息', '学校1', '7001');
  school[2] := myinifile.ReadString('基本信息', '学校2', '7035');
  con1.Connected := false;
  con1.ConnectionString := 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source=' +
    apppath + '\data\准考证.mdb;Persist Security Info=False';
  edt1.Text := myinifile.ReadString('基本信息', 'cs', '20199108');
  cbb2.ItemIndex := myinifile.ReadInteger('基本信息', '入学年份', 2);
  cbb1.ItemIndex := myinifile.ReadInteger('基本信息', '年级', 1);
  rg1.ItemIndex := myinifile.ReadInteger('基本信息', '准考号', 1);
  cbb1Change(nil);
  myinifile.Free;
end;

procedure qry2update(sqlstr: string);
begin
  with form1.qry2 do
  begin
    Close;
    SQL.Clear;
    sql.Add(sqlstr);
    Prepared;
    ExecSQL;
  end;
end;

function getData(sqlstr: string): Integer;
begin
  with form1.qry2 do
  begin
    Close;
    SQL.Clear;
    sql.Add(sqlstr);
    Open;
    if recordcount > 0 then
      Result := Fields[0].AsInteger
    else
      Result := 0;
  end;
end;

procedure TForm1.btn4Click(Sender: TObject);
var
  i, j, k: Integer;
  kch, zwh: Integer;
  kchBegin7001, kchEnd7001, kchBegin7035, kchEnd7035: Integer;
  zz, zwhBegin7001, zwhEnd7001, zwhBegin7035, zwhEnd7035: Integer;
  maxkm: Integer;
  sqlstr: string;
  kcbp7001, kcbp7035: array of array of Integer;
begin
  if Application.MessageBox('开始编排将会覆盖对应场次信息,是否确认?',
    '即将开始编排考场信息', MB_OKCANCEL + MB_ICONQUESTION) = IDOK then
  begin
    qry2update('delete * from 考场编排 where cs=' + edt1.Text);
    pb1.Position := 0;
    pb1.Max := 7;
    if cbb1.Text = '高一' then
      maxkm := 1
    else
      maxkm := 7;

    with qry1 do
    begin
      for i := 1 to maxkm do
      begin
        sqlstr := '';
        sqlstr := sqlstr +
          ' insert into 考场编排(cs,姓名,学籍辅号,班级,年级,选考科目,学籍校,座号,原籍校,在校生,入学年份,学校代号,年级代号,月考成绩,学校名称,科目代号,科目,学考,外语,固定考号) ';
        sqlstr := sqlstr + 'select ' + edt1.Text +
          ',姓名,学籍辅号,班级,年级,选考科目,学籍校,座号,原籍校,在校生,入学年份,学校代号,年级代号,月考成绩,学校名称,' +
          inttostr(i) + ',''' + km[i] + ''',0,外语,固定考号  from 学生信息表  where 入学年份=' +
          rxnf + ' and 在校生=1 and 年级=''' + nj + ''' ';
        if i = 1 then
          sqlstr := sqlstr + ' order by 外语 desc,月考成绩 desc'
        else
          sqlstr := sqlstr + ' and 选考科目 like ''%' + km[i] +
            '%'' order by 月考成绩 desc';
              qry2update(sqlstr);

        if chk1.Checked =true then
        begin
          sqlstr := '';
        sqlstr := sqlstr +
          ' insert into 考场编排(cs,姓名,学籍辅号,班级,年级,选考科目,学籍校,座号,原籍校,在校生,入学年份,学校代号,年级代号,月考成绩,学校名称,科目代号,科目,学考,外语) ';
        sqlstr := sqlstr + 'select ' + edt1.Text +
          ',姓名,学籍辅号,班级,年级,选考科目,学籍校,座号,原籍校,在校生,入学年份,学校代号,年级代号,月考成绩,学校名称,' +
          inttostr(i) + ',''' + km[i] + ''',1,外语  from 学生信息表  where 入学年份=' +
          rxnf + ' and 在校生=1 and 年级=''' + nj + ''' ';
        if i > 1 then
           begin
          sqlstr := sqlstr + ' and 选考科目 not like ''%' + km[i] +
            '%'' order by 月考成绩 desc';
            qry2update(sqlstr);
           end;
        end;

        close;
        SQL.Clear;
        SQL.Add('select * from 考场编排 where 科目代号=' + inttostr(i) +
          ' and cs= ' + edt1.Text +
          ' and 学校代号=7001  order by 学考,外语 desc,月考成绩 desc');
        Open;
        sqlstr := 'select 开始考场,结束考场,起始座号,考场人数  from 考场设置 where 科目代号='
          + inttostr(i) +
          '  and 学校代号=7001 and 入学年份=' + rxnf + ' order by 开始考场,起始座号';
        qry2.Close;
        qry2.SQL.Clear;
        qry2.SQL.Add(sqlstr);
        qry2.open;
        SetLength(kcbp7001, qry2.RecordCount, 4);
        for j := 0 to qry2.RecordCount - 1 do
        begin
          for k := 0 to 3 do
            kcbp7001[j, k] := qry2.Fields[k].AsInteger;
        qry2.Next;
        end;


        for j := 0 to qry2.RecordCount - 1 do
        begin
          for kch := kcbp7001[j][0] to kcbp7001[j][1] do    //   开始考场,结束考场,起始座号,考场人数  0,1,2,3
          begin

            for zwh := kcbp7001[j][2] to kcbp7001[j][3] do
            begin
              if qry1.Eof then
                Break;
              Edit;
              FieldByName('考场').AsInteger := kch;
              FieldByName('座位号').AsInteger := zwh;
              post;
              next;

            end;

          end;
        end;
        close;
        SQL.Clear;
        SQL.Add('select * from 考场编排 where 科目代号=' + inttostr(i) +
          ' and cs= ' + edt1.Text +
          ' and 学校代号=7035  order by 学考,外语 desc,月考成绩 desc');
        Open;
        sqlstr := 'select 开始考场,结束考场,起始座号,考场人数  from 考场设置 where 科目代号='
          + inttostr(i) +
          '  and 学校代号=7035 and 入学年份=' + rxnf + ' order by 开始考场,起始座号';
          mmo1.Lines.Add(sqlstr);
        qry2.Close;
        qry2.SQL.Clear;
        qry2.SQL.Add(sqlstr);
        qry2.open;
        SetLength(kcbp7035, qry2.RecordCount, 4);
        for j := 0 to qry2.RecordCount - 1 do
        begin
          for k := 0 to 3 do
            kcbp7035[j, k] := qry2.Fields[k].AsInteger;
            qry2.Next;
        end;

         for j := 0 to qry2.RecordCount - 1 do
        begin
          for kch := kcbp7035[j][0] to kcbp7035[j][1] do    //   开始考场,结束考场,起始座号,考场人数  0,1,2,3
          begin

            for zwh := kcbp7035[j][2] to kcbp7035[j][3] do
            begin
              if qry1.Eof then
                Break;
              Edit;
              FieldByName('考场').AsInteger := kch;
              FieldByName('座位号').AsInteger := zwh;
              post;
              next;

            end;

          end;
        end;

      end;
    end;
    pb1.Position := pb1.Max;
    btn13Click(nil);
    btn11Click(nil);
    btn6Click(nil);
  end;

end;

procedure TForm1.btn5Click(Sender: TObject);
var
  query: tadoquery;
  conn: TADOConnection;
  ado_connectionstring: string;
  i: integer;
  fcount: integer;

  tl: TStringList;
begin
  tl := TStringList.Create;
  if Application.MessageBox('该操作将清空原有数据,是否继续?', '提示', MB_YESNO)
    = IDYES then
  begin
    dlgOpen1.InitialDir := ExtractFilePath(Application.ExeName);
    if dlgOpen1.Execute then
    begin
      try
        conn := TADOConnection.Create(nil);
        query := TADOQuery.Create(nil);
        ADO_Connectionstring := 'Provider=Microsoft.ACE.OLEDB.12.0;' +
          'Data Source=' +
          dlgOpen1.FileName +
          ';Mode=ReadWrite|Share Deny None;' +
          'Extended Properties=Excel 8.0;Persist Security Info=False';
        conn.ConnectionString := ado_connectionstring;
        conn.LoginPrompt := false;
        query.Connection := conn;
        conn.GetTableNames(tl, False);

        query.close;
        query.SQL.Clear;
        query.SQL.Add('select * from [' + tl[0] + ']');

        // query.SQL.Add('select * from [sheet1$] ');
        query.Open;
        fcount := query.RecordCount;

        if fcount > 0 then
        begin
          with qry1 do
          begin

            Close;
            sql.Clear;
            sql.Add('delete * from 学生信息表 where 年级=''' + nj +
              ''' and 入学年份=' + rxnf);
            Prepared;
            ExecSQL;
            Close;
            sql.Clear;
            sql.Add('select * from 学生信息表 where 1=0');
            Open;

            for i := 0 to fcount do
            begin
              Application.ProcessMessages;
              Append;
              FieldByName('座号').Value :=
                Trim(query.Fieldbyname('座号').AsString);
              FieldByName('学校名称').Value :=
                Trim(query.Fieldbyname('学校名称').AsString);
              FieldByName('姓名').Value :=
                Trim(query.Fieldbyname('姓名').AsString);
              FieldByName('学籍辅号').Value :=
                Trim(query.Fieldbyname('学籍辅号').AsString);
              FieldByName('年级').Value :=
                Trim(query.Fieldbyname('年级').AsString);
              FieldByName('班级').Value :=
                Trim(query.Fieldbyname('班级').AsString);
              FieldByName('学籍校').Value :=
                Trim(query.Fieldbyname('学籍校').AsString);
              FieldByName('入学年份').Value :=
                Trim(query.Fieldbyname('入学年份').AsString);
              FieldByName('原籍校').Value :=
                Trim(query.Fieldbyname('原籍校').AsString);
              FieldByName('学校代号').Value :=
                Trim(query.Fieldbyname('学校代号').AsString);
              FieldByName('年级代号').Value :=
                Trim(query.Fieldbyname('年级代号').AsString);
              FieldByName('选考科目').Value :=
                Trim(query.Fieldbyname('选考科目').AsString);
              FieldByName('在校生').Value :=
                Trim(query.Fieldbyname('在校生').AsString);
              FieldByName('月考成绩').Value :=
                Trim(query.Fieldbyname('月考成绩').AsString);
                              FieldByName('外语').Value :=
                Trim(query.Fieldbyname('外语').AsString);
                              FieldByName('固定考号').Value :=
                Trim(query.Fieldbyname('固定考号').AsString);
              edit;
              query.Next;
            end;

          end;
        end;
      finally
        conn.Connected := false;
        tl.Destroy;
      end;
    end;
  end;
end;

procedure TForm1.btn6Click(Sender: TObject);
begin
  pnl2.Visible := true;
  pnl3.Visible := false;
  qry1select('select * from 考场编排 where cs=' + edt1.Text +
    ' and (学籍辅号 like ''%' + edt2.Text + '%'' or 姓名 like ''%' + edt2.Text +
    '%'' )  order by 考场,座位号');

end;

function Tform1.ExportToExcel(mb: string; qsks, jsks: Integer): Boolean;
var
  i, j, kmid, maxkm, schoolid: Integer;

  XLApp: Variant;
  Sheet: Variant;

  path, path1, mbfile, subpath: string;
  s, newkc: string;

  sqlstr, path2: string;
begin
  if cbb1.Text = '高一' then
    maxkm := 1
  else
    maxkm := 7;
    pb1.Position:=0;
  for kmid := 1 to maxkm do
  begin
      pb1.Position:= kmid*100 div maxkm    ;
    for schoolid := 1 to 2 do
    begin
      try

        path := ExtractFilePath(Application.ExeName);
        mbfile := path + '模板\';
        path2 := path + nj + '\';
        if not DirectoryExists(path2) then
        begin
          //CreateDir(path2);
          ForceDirectories(path2);
        end;
        path2 := path2 + edt1.Text + '\' + '好分数\';
        if not DirectoryExists(path2) then
        begin
          // CreateDir(path2);
          ForceDirectories(path2); //创建目录
        end;

        if mb = '好分数考生模板' then
        begin
          // sqlstr:='select "福建省福安第一中学",xm,xh,zkh,'''+nj+''',bj,ks,kh from 编排准考证 where cs='+edt1.Text+' and bcj=0 and zkh<>0 '+wenli+yzj+' order by ks,kh';

          sqlstr := 'select 学校名称,姓名,学籍辅号,考号,年级,班级,考场,座位号,原籍校,外语 from 考场编排 where cs = '
            + edt1.Text + ' and 科目=''' + km[kmid] + ''' and 学校代号=' +
            school[schoolid] + ' and 考场>0 order by 考号,科目代号';
          s := cbb1.Text + mb + km[kmid] + school[schoolid] + '.xls';
        end
        else if mb = '标签打印模板' then
        begin
          //  sqlstr:='select yzj,xm,xh,zkh,'''+nj+''',bj,zh,ks,kh,wenli,ksdd from 编排准考证 where cs='+edt1.Text+' and bcj=0 and zkh<>0 '+wenli+yzj+' and ks>='+inttostr(qsks)+' and ks<='+inttostr(jsks)+' order by ks,kh';
          s := cbb1.Text + mb + IntToStr(qsks) + '-' + inttostr(jsks) +
            '考场.xls';
        end
        else if mb = '缺考考生模板' then
        begin
          // sqlstr:='select xm,zkh,bj,ks,kh,qk01,qk02,qk03,qk04,qk05,qk06,qk07,qk08,qk09,qk10,xh from 编排准考证 where cs='+edt1.Text+' and bcj=0 and zkh<>0 and (qk01<>"" or qk02<>"" or qk03<>"" or qk04<>"" or qk05<>"" or qk06<>"" or qk07<>"" or qk08<>"" or qk09<>"" or qk10<>"" )  order by ks,kh'   ;
          s := mb + '.xls';
        end
        else if mb = '考生信息模板' then
        begin
          // sqlstr:='select yzj,xm,xh,zkh,'''+nj+''',bj,zh,ks,kh,wenli,ksdd from 编排准考证 where cs='+edt1.Text+' and bcj=0 and zkh<>0 '+wenli+yzj+' order by ks,kh';
          s := cbb1.Text + mb + '.xls';
        end;

        mbfile := mbfile + mb + '.xls';
        if not DirectoryExists(PChar(path2)) then
          CreateDirectory(PChar(path2), nil);

        newkc := path2 + s;
        if FileExists(newkc) then
          DeleteFile(newkc);
        CopyFile(PChar(mbfile), PChar(newkc), false);
        Sleep(500);
        Result := False;
        if not VarIsEmpty(XLApp) then
        begin
          XLApp.DisplayAlerts := False;
          XLApp.Quit;
          VarClear(XLApp);
        end;

        try
          XLApp := CreateOleObject('Excel.Application');
        except
          Exit;
        end;

        if not FileExists(newkc) then
          exit;
        XLApp.WorkBooks.Open(newkc);
        XLApp.WorkSheets[1].Activate;

        XLApp.WorkBooks[1].WorkSheets[1].Name := mb;
        Sheet := XLApp.Workbooks[1].WorkSheets[1];

        with qry1 do
        begin
          close;
          SQL.Clear;
          sql.Add(sqlstr);
          Open;
          if recordcount > 0 then
          begin
            for i := 0 to RecordCount - 1 do
            begin

              Application.ProcessMessages;
              for j := 0 to FieldCount - 1 do
              begin
                Sheet.Cells[i + 3, j + 1] := Fields[j].AsString;

              end;
              Next;
            end;
          end;

        end;
        if mb = '标签打印模板' then
          XLApp.range['2:2'].delete;
        XLApp.range['A1:A1'].select;
        XlApp.ActiveWorkbook.Save;
        XlApp.Visible := false;
      finally
        XLApp.quit;

      end;
    end;
    end;
end;

procedure TForm1.btn8Click(Sender: TObject);
var
  query: tadoquery;
  conn: TADOConnection;
  ado_connectionstring: string;
  i: integer;
  fcount: integer;

  tl: TStringList;
begin
  tl := TStringList.Create;
  if Application.MessageBox('该操作将清空原有数据,是否继续?', '提示', MB_YESNO)
    = IDYES then
  begin
    dlgOpen1.InitialDir := ExtractFilePath(Application.ExeName);
    if dlgOpen1.Execute then
    begin
      try
        conn := TADOConnection.Create(nil);
        query := TADOQuery.Create(nil);
        ADO_Connectionstring := 'Provider=Microsoft.ACE.OLEDB.12.0;' +
          'Data Source=' +
          dlgOpen1.FileName +
          ';Mode=ReadWrite|Share Deny None;' +
          'Extended Properties=Excel 8.0;Persist Security Info=False';
        conn.ConnectionString := ado_connectionstring;
        conn.LoginPrompt := false;
        query.Connection := conn;
        conn.GetTableNames(tl, False);

        query.close;
        query.SQL.Clear;
        query.SQL.Add('select * from [' + tl[0] + ']');

        // query.SQL.Add('select * from [sheet1$] ');
        query.Open;
        fcount := query.RecordCount;

        if fcount > 0 then
        begin
          with qry1 do
          begin

            Close;
            sql.Clear;
            sql.Add('delete * from 考试地点表 ');
            Prepared;
            ExecSQL;
            Close;
            sql.Clear;
            sql.Add('select * from 考试地点表 where 1=0');
            Open;

            for i := 0 to fcount do
            begin
              Application.ProcessMessages;
              Append;
              FieldByName('id').Value :=
                Trim(query.Fieldbyname('id').AsString);
              FieldByName('年级').Value :=
                Trim(query.Fieldbyname('年级').AsString);
              FieldByName('考场').Value :=
                Trim(query.Fieldbyname('考场').AsString);
              FieldByName('考试地点').Value :=
                Trim(query.Fieldbyname('考试地点').AsString);

              edit;
              if query.RecNo = query.RecordCount then
                Break;
              query.Next;
            end;

          end;
        end;
      finally
        conn.Connected := false;
        tl.Destroy;
      end;
    end;
  end;
end;

procedure TForm1.btn9Click(Sender: TObject);
begin
  pnl2.Visible := true;
  pnl3.Visible := false;
  qry1select('select * from 考试地点表 where 年级=''' + cbb1.Text +
    ''' order by 考场');
end;

procedure TForm1.btn10Click(Sender: TObject);
var
  bj, bjold, i, j, k,m, cellrow, cellcloumn: Integer;

  XLApp: Variant;
  Sheet: Variant;

  path, path1, mbfile, subpath: string;
  s, newkc: string;

  km, sqlstr, path2: string;
begin
  try

    path := ExtractFilePath(Application.ExeName) + '';
    mbfile := path + '模板\';
    path2 := path + nj + '\';
    path2 := path2 + edt1.Text + '\' + '准考证\';
    s := cbb1.Text + '准考证打印' + '.xls';

    if (nj='高二') or (nj='高三') then
    begin
     mbfile := mbfile + '选科准考证打印.xls';
    end
    else
    mbfile := mbfile + '准考证打印.xls';
    if not DirectoryExists(PChar(path2)) then
      CreateDirectory(PChar(path2), nil);
    newkc := path2 + s;
    if FileExists(newkc) then
      DeleteFile(newkc);
    CopyFile(PChar(mbfile), PChar(newkc), false);
    Sleep(500);

    if not VarIsEmpty(XLApp) then
    begin
      XLApp.DisplayAlerts := False;
      XLApp.Quit;
      VarClear(XLApp);
    end;
    try
      XLApp := CreateOleObject('Excel.Application');
    except
      Exit;
    end;
    if not FileExists(newkc) then
      exit;
    XLApp.WorkBooks.Open(newkc);
    XLApp.WorkSheets[1].Activate;
    XLApp.WorkBooks[1].WorkSheets[1].Name := '准考证';
    Sheet := XLApp.Workbooks[1].WorkSheets[1];
    with qry1 do
    begin

      sqlstr := 'select cs,班级,座号,科目,姓名,考号,考场,座位号,考试地点,外语,学籍辅号,选考科目 from 考场编排 where cs ='
        + edt1.Text + ' and 考场>0 order by 班级,座号,学籍辅号,科目代号 ';
      qry1select(sqlstr);
      k := -1;
      if recordcount > 0 then
      begin
        pb1.Position:=0;
        for i := 0 to RecordCount - 1 do
        begin
          pb1.Position:= (i+1)*100 div RecordCount    ;
          Application.ProcessMessages;
          bjold := bj;
          bj := FieldByName('班级').AsInteger;
            if (nj='高二') or (nj='高三') then
            begin
              if bj > bjold then
              begin
                k := k + 1;

              end
              else
              begin
                k := k + 1;
              end;

              cellrow := 1 + k * 8;
                cellcloumn := 1     ;

              XLApp.range[Sheet.Cells[1, 1], Sheet.Cells[7, 5]].Copy;
              Sheet.Cells[cellrow, cellcloumn].PasteSpecial;
              for m:=0 to 3 do
              begin
              km := FieldByName('科目').AsString;
              if km = '外语' then
                km := '数'+FieldByName('外语').AsString;

              Sheet.cells[cellrow + 1, cellcloumn] := FieldByName('cs').AsString;   //第2行第1列
              Sheet.cells[cellrow + 1, cellcloumn+1] := FieldByName('班级').AsString;   //第2行第2列
              Sheet.cells[cellrow + 1, cellcloumn + 2] :=
                FieldByName('座号').AsString;              //第2行第3列
              Sheet.cells[cellrow + 1, cellcloumn + 3] :=
                FieldByName('姓名').AsString;        //第2行第4列
                              Sheet.cells[cellrow + 1, cellcloumn + 4] :=
                FieldByName('学籍辅号').AsString;        //第2行第6列
              Sheet.cells[cellrow + 3+m, cellcloumn] := km;       //第4行第1列

              Sheet.cells[cellrow + 3+m, cellcloumn + 1] :=
                FieldByName('考场').AsString;           //第4行第2列
              Sheet.cells[cellrow + 3+m, cellcloumn + 2] :=
                FieldByName('座位号').AsString;          //第4行第3列
                               Sheet.cells[cellrow + 3+m, cellcloumn + 3] :=
                FieldByName('考号').AsString;        //第4行第4列
                              Sheet.cells[cellrow + 3+m, cellcloumn + 4] :=
                FieldByName('考试地点').AsString;        //第4行第6列

                 Next;
              end;
            end
            else
            begin
              if bj > bjold then
              begin
                k := k + 3;
                Sheet.rows[1 + (k div 2) * 5].pagebreak := 1;
              end
              else
              begin
                k := k + 1;
              end;

              cellrow := 1 + (k div 2) * 5;

              if i mod 2 = 0 then
                cellcloumn := 1
              else
                cellcloumn := 6;
              XLApp.range[Sheet.Cells[1, 1], Sheet.Cells[4, 4]].Copy;
              Sheet.Cells[cellrow, cellcloumn].PasteSpecial;
              km := FieldByName('科目').AsString;
              if km = '外语' then
                km := '数'+FieldByName('外语').AsString;
              Sheet.cells[cellrow + 1, cellcloumn + 1] := km;
              Sheet.cells[cellrow + 1, cellcloumn] := FieldByName('班级').AsString;
              Sheet.cells[cellrow + 1, cellcloumn + 2] :=
                FieldByName('姓名').AsString;
              Sheet.cells[cellrow + 1, cellcloumn + 3] :=
                FieldByName('考号').AsString;
              Sheet.cells[cellrow + 3, cellcloumn] := FieldByName('考场').AsString;
              Sheet.cells[cellrow + 3, cellcloumn + 1] :=
                FieldByName('座位号').AsString;
              Sheet.cells[cellrow + 3, cellcloumn + 2] :=
                FieldByName('考试地点').AsString;
                 Next;
            end;

         if ((nj='高二') or (nj='高三')) and (i*4>recordcount) then
         Break;
        end;
      end;
      XLApp.range['A3:A3'].select;
      XlApp.ActiveWorkbook.Save;
      XlApp.Visible := false;
      showmessage('done')
    end;

  finally
    XLApp.quit;
  end;
end;

procedure TForm1.btn11Click(Sender: TObject);
begin
  qry2update('update 考场编排 a inner join 考试地点表 b on a.年级=b.年级 and a.考场=b.考场 set a.考试地点=b.考试地点 where a.cs= '
    + edt1.Text);
  btn6Click(nil);
end;

procedure TForm1.btn12Click(Sender: TObject);
var
  i, j, kmid, maxkm, schoolid: Integer;

  XLApp: Variant;
  Sheet: Variant;

  path, path1, mbfile, subpath: string;
  s, newkc: string;

  sqlstr, path2, mb: string;
begin
  mb := '考生信息模板';
  if cbb1.Text = '高一' then
    maxkm := 1
  else
    maxkm := 7;
    pb1.Position:=0;
    try

      path := ExtractFilePath(Application.ExeName);
      mbfile := path + '模板\';
      path2 := path + nj + '\';
      if not DirectoryExists(path2) then
      begin
        //CreateDir(path2);
        ForceDirectories(path2);
      end;
      path2 := path2 + edt1.Text + '\考生信息\';
      if not DirectoryExists(path2) then
      begin
        // CreateDir(path2);
        ForceDirectories(path2); //创建目录
      end;

      sqlstr := 'select cs,科目代号,科目,考场,学校代号,count(座号) as 人数 from 考场编排 where cs='+edt1.Text+' group by cs,科目代号,科目,考场,学校代号 order by 科目代号,考场';
      s := '00'+cbb1.Text + '考场安排汇总.xls';

      mbfile := mbfile +  '考场安排汇总.xls';
      if not DirectoryExists(PChar(path2)) then
        CreateDirectory(PChar(path2), nil);

      newkc := path2 + s;
      if FileExists(newkc) then
        DeleteFile(newkc);
      CopyFile(PChar(mbfile), PChar(newkc), false);
      Sleep(500);

      if not VarIsEmpty(XLApp) then
      begin
        XLApp.DisplayAlerts := False;
        XLApp.Quit;
        VarClear(XLApp);
      end;

      try
        XLApp := CreateOleObject('Excel.Application');
      except
        Exit;
      end;

      if not FileExists(newkc) then
        exit;
      XLApp.WorkBooks.Open(newkc);
      XLApp.WorkSheets[1].Activate;

      XLApp.WorkBooks[1].WorkSheets[1].Name := mb;
      Sheet := XLApp.Workbooks[1].WorkSheets[1];

      with qry1 do
      begin
        close;
        SQL.Clear;
        sql.Add(sqlstr);
        Open;
        if recordcount > 0 then
        begin
          for i := 0 to RecordCount - 1 do
          begin

            Application.ProcessMessages;
            for j := 0 to FieldCount - 1 do
            begin
              Sheet.Cells[i + 2, j + 1] := Fields[j].AsString;

            end;
            Next;
          end;
        end;

      end;
      XLApp.range['A1:A1'].select;
      XlApp.ActiveWorkbook.Save;
      XlApp.Visible := false;
    finally
      XLApp.quit;

    end;
  for kmid := 1 to maxkm do
  begin
      pb1.Position:= kmid*100 div maxkm    ;
    try

      path := ExtractFilePath(Application.ExeName);
      mbfile := path + '模板\';
      path2 := path + nj + '\';
      if not DirectoryExists(path2) then
      begin
        //CreateDir(path2);
        ForceDirectories(path2);
      end;
      path2 := path2 + edt1.Text + '\考生信息\';
      if not DirectoryExists(path2) then
      begin
        // CreateDir(path2);
        ForceDirectories(path2); //创建目录
      end;

      sqlstr := 'select 学校代号,姓名,学籍辅号,考号,年级,班级,座号,考场,座位号,科目,考试地点,选考科目,外语 from 考场编排 where cs = '
        + edt1.Text + ' and 科目=''' + km[kmid] +
          '''   order by 科目代号,考场,座位号';
      s := cbb1.Text + km[kmid] + '考生信息表(按考场).xls';

      mbfile := mbfile + mb + '.xls';
      if not DirectoryExists(PChar(path2)) then
        CreateDirectory(PChar(path2), nil);

      newkc := path2 + s;
      if FileExists(newkc) then
        DeleteFile(newkc);
      CopyFile(PChar(mbfile), PChar(newkc), false);
      Sleep(500);

      if not VarIsEmpty(XLApp) then
      begin
        XLApp.DisplayAlerts := False;
        XLApp.Quit;
        VarClear(XLApp);
      end;

      try
        XLApp := CreateOleObject('Excel.Application');
      except
        Exit;
      end;

      if not FileExists(newkc) then
        exit;
      XLApp.WorkBooks.Open(newkc);
      XLApp.WorkSheets[1].Activate;

      XLApp.WorkBooks[1].WorkSheets[1].Name := mb;
      Sheet := XLApp.Workbooks[1].WorkSheets[1];

      with qry1 do
      begin
        close;
        SQL.Clear;
        sql.Add(sqlstr);
        Open;
        if recordcount > 0 then
        begin
          for i := 0 to RecordCount - 1 do
          begin

            Application.ProcessMessages;
            for j := 0 to FieldCount - 1 do
            begin
              Sheet.Cells[i + 3, j + 1] := Fields[j].AsString;

            end;
            Next;
          end;
        end;

      end;
      if mb = '标签打印模板' then
        XLApp.range['2:2'].delete;
      XLApp.range['A1:A1'].select;
      XlApp.ActiveWorkbook.Save;
      XlApp.Visible := false;
    finally
      XLApp.quit;

    end;
  end;
  for kmid := 1 to maxkm do
  begin
    try

      path := ExtractFilePath(Application.ExeName);
      mbfile := path + '模板\';
      path2 := path + nj + '\';
      if not DirectoryExists(path2) then
      begin
        //CreateDir(path2);
        ForceDirectories(path2);
      end;
      path2 := path2 + edt1.Text + '\考生信息\';
      if not DirectoryExists(path2) then
      begin
        // CreateDir(path2);
        ForceDirectories(path2); //创建目录
      end;

      sqlstr := 'select 学校代号,姓名,学籍辅号,考号,年级,班级,座号,考场,座位号,科目,考试地点,选考科目,外语 from 考场编排 where cs = '
        + edt1.Text + ' and 科目=''' + km[kmid] +
          ''' and 考场>0 order by 班级,座号,科目代号';
      s := cbb1.Text + km[kmid] + '考生信息表(按班级).xls';

      mbfile := mbfile + mb + '.xls';
      if not DirectoryExists(PChar(path2)) then
        CreateDirectory(PChar(path2), nil);

      newkc := path2 + s;
      if FileExists(newkc) then
        DeleteFile(newkc);
      CopyFile(PChar(mbfile), PChar(newkc), false);
      Sleep(500);

      if not VarIsEmpty(XLApp) then
      begin
        XLApp.DisplayAlerts := False;
        XLApp.Quit;
        VarClear(XLApp);
      end;

      try
        XLApp := CreateOleObject('Excel.Application');
      except
        Exit;
      end;

      if not FileExists(newkc) then
        exit;
      XLApp.WorkBooks.Open(newkc);
      XLApp.WorkSheets[1].Activate;

      XLApp.WorkBooks[1].WorkSheets[1].Name := mb;
      Sheet := XLApp.Workbooks[1].WorkSheets[1];

      with qry1 do
      begin
        close;
        SQL.Clear;
        sql.Add(sqlstr);
        Open;
        if recordcount > 0 then
        begin
          for i := 0 to RecordCount - 1 do
          begin

            Application.ProcessMessages;
            for j := 0 to FieldCount - 1 do
            begin
              Sheet.Cells[i + 3, j + 1] := Fields[j].AsString;

            end;
            Next;
          end;
        end;

      end;
      if mb = '标签打印模板' then
        XLApp.range['2:2'].delete;
      XLApp.range['A1:A1'].select;
      XlApp.ActiveWorkbook.Save;
      XlApp.Visible := false;
    finally
      XLApp.quit;

    end;
  end;

end;

procedure TForm1.btn13Click(Sender: TObject);
begin
  if rg1.ItemIndex = 0 then

    qry2update('update 考场编排 set 考号=年级代号&Format(班级,"00")&Format(座号,"00")&Format(考场,"00")&Format(座位号,"00") where cs= '
      + edt1.Text)
  else if rg1.ItemIndex = 1 then

    qry2update('update 考场编排 set 考号=年级代号&科目代号&Format(班级,"00")&Format(座号,"00")&Format(考场,"00")&Format(座位号,"00") where cs= '
      + edt1.Text)
  else if rg1.ItemIndex = 2 then
    qry2update('update 考场编排 set 考号=学校代号&年级代号&科目代号&Format(考场,"00")&Format(座位号,"00") where cs= '
      + edt1.Text)
  else if rg1.ItemIndex = 3 then
        qry2update('update 考场编排 set 考号=固定考号 where cs= '
      + edt1.Text)

end;

procedure TForm1.btn14Click(Sender: TObject);
var
  i, j, k, l, cellrow, cellcloumn: Integer;
  kmid, maxkm, schoolid: Integer;
  XLApp: Variant;
  Sheet: Variant;

  path, path1, mbfile, subpath: string;
  s, newkc: string;

  sqlstr, path2: string;
  kclist: TStringList;
begin

  path := ExtractFilePath(Application.ExeName) + '\';

  if nj = '高一' then
    maxkm := 1
  else
    maxkm := 7;
  path2 := path + nj + '\';
  path2 := path2 + edt1.Text + '\' + '签到表\';
  pb1.Position:=0;
  for kmid := 1 to maxkm do
  begin
    pb1.Position:= kmid*100 div maxkm    ;
    for schoolid := 1 to 2 do
    begin
      try
        kclist := TStringList.Create;
        mbfile := path + '模板\';
        s := cbb1.Text + km[kmid] + school[schoolid] + '考生签到表' + '.xls';
 
        mbfile := mbfile + '考生签到表.xls';
        if not DirectoryExists(PChar(path2)) then
          CreateDirectory(PChar(path2), nil);

        newkc := path2 + s;
        if FileExists(newkc) then
          DeleteFile(newkc);
        CopyFile(PChar(mbfile), PChar(newkc), true);
        Sleep(500);

        if not VarIsEmpty(XLApp) then
        begin
          XLApp.DisplayAlerts := False;
          XLApp.Quit;
          VarClear(XLApp);
        end;

        try
          XLApp := CreateOleObject('Excel.Application');
        except
          Exit;
        end;

        if not FileExists(newkc) then
          exit;
        XLApp.WorkBooks.Open(newkc);
        XLApp.WorkSheets[1].Activate;

        XLApp.WorkBooks[1].WorkSheets[1].Name := '签到表';
        Sheet := XLApp.Workbooks[1].WorkSheets[1];

        with qry1 do
        begin
          sqlstr := 'select distinct 考场 from 考场编排 where cs=' + edt1.Text +
            ' and 科目代号=' + inttostr(kmid) + ' and 学校代号=' +
              school[schoolid] + ' and 考场>0 order by 考场';

          close;
          SQL.Clear;
          sql.Add(sqlstr);
          Open;


          if recordcount > 0 then
          begin
            for i := 0 to RecordCount - 1 do
            begin
              kclist.Add(Fields[0].AsString);
              next;
            end;
          end;

          for i := 0 to kclist.Count - 1 do
          begin
            sqlstr := 'select 考场,座位号,姓名,班级,考号,考试地点,学籍辅号,外语 from 考场编排 where 考场='
              + kclist[i] + ' and cs=' + edt1.Text +
              ' and 科目代号=' + inttostr(kmid) + ' and 学校代号=' +
                school[schoolid] + ' order by 考场,座位号';

            close;
            SQL.Clear;
            sql.Add(sqlstr);
            Open;

            Application.ProcessMessages;

            XLApp.range[Sheet.Cells[1, 10], Sheet.Cells[36, 18]].Copy;
            Sheet.Cells[1 + i * 36, 1].PasteSpecial;
            for j := 0 to recordcount - 1 do
            begin
              Sheet.cells[1 + i * 36, 6] := '第' + FieldByName('考场').AsString +
                '考场,' + FieldByName('考试地点').AsString;

              Sheet.cells[3 + j + i * 36, 1] := FieldByName('考场').AsString;
              Sheet.cells[3 + j + i * 36, 2] := FieldByName('座位号').AsString;
              Sheet.cells[3 + j + i * 36, 3] := FieldByName('姓名').AsString;
              Sheet.cells[3 + j + i * 36, 4] := FieldByName('班级').AsString;
              Sheet.cells[3 + j + i * 36, 5] := FieldByName('考号').AsString;

              Next;
            end;
          end;
          XLApp.range[Sheet.Cells[1, 10], Sheet.Cells[36, 18]].delete;

        end;
        XLApp.range['A3:A3'].select;
        XlApp.ActiveWorkbook.Save;
        XlApp.Visible := false;
      finally
        XLApp.quit;
        kclist.Destroy;

      end;
    end;
 end;
end;

procedure TForm1.btn15Click(Sender: TObject);
var
  query: tadoquery;
  conn: TADOConnection;
  ado_connectionstring: string;
  i: integer;
  fcount: integer;

  tl: TStringList;
begin
  tl := TStringList.Create;

  dlgOpen1.InitialDir := ExtractFilePath(Application.ExeName);
  if dlgOpen1.Execute then
  begin
    try
      conn := TADOConnection.Create(nil);
      query := TADOQuery.Create(nil);
      ADO_Connectionstring := 'Provider=Microsoft.ACE.OLEDB.12.0;' +
        'Data Source=' +
        dlgOpen1.FileName +
        ';Mode=ReadWrite|Share Deny None;' +
        'Extended Properties=Excel 8.0;Persist Security Info=False';
      conn.ConnectionString := ado_connectionstring;
      conn.LoginPrompt := false;
      query.Connection := conn;
      conn.GetTableNames(tl, False);

      query.close;
      query.SQL.Clear;
      query.SQL.Add('select * from [' + tl[0] + ']');

      // query.SQL.Add('select * from [sheet1$] ');
      query.Open;
      fcount := query.RecordCount;
      pb1.Position := 0;
      qry2update('update 学生信息表 set 月考成绩=0 where 年级代号=' + njid +
        ' and 入学年份=' + rxnf);

      if fcount > 0 then
      begin
        for i := 0 to fcount do
        begin
          pb1.Position := (i + 1) * 100 div fcount;
          qry2update('update 学生信息表 set 月考成绩=' +
            query.fieldbyname('总分').asstring + ',固定考号='''+query.fieldbyname('固定考号').asstring+''' where 学籍辅号=''' +
            query.fieldbyname('学籍辅号').AsString + '''');
          Application.ProcessMessages;
          query.Next;
        end;
        btn1Click(nil);
        pb1.Position := 0;
      end;
    finally
      conn.Connected := false;
      tl.Destroy;
    end;
  end;

end;

procedure TForm1.FormClose(Sender: TObject; var Action: TCloseAction);
var
  apppath: string;
  filename: string;
  myinifile: TIniFile;
begin

  apppath := ExtractFilePath(Application.ExeName);
  Filename := apppath + '参数/参数.ini';
    //指明路径.如果不指明路径.文件将在windows目录建立
  myinifile := Tinifile.Create(Filename); //Create('program.ini');
  con1.Connected := false;
  myinifile.WriteInteger('基本信息', '入学年份', cbb2.ItemIndex);
  myinifile.WriteInteger('基本信息', '年级', cbb1.ItemIndex);
  myinifile.WriteInteger('基本信息', '准考号', rg1.ItemIndex);
  myinifile.WriteString('基本信息', 'cs', edt1.Text);
  myinifile.Free;
end;

procedure TForm1.btn16Click(Sender: TObject);
var
  i, j, kmid, maxkm, schoolid: Integer;

  XLApp: Variant;
  Sheet: Variant;

  path, path1, mbfile, subpath: string;
  s, newkc: string;

  sqlstr, path2, mb,value: string;
begin
  try
      mb:='条形码' ;
      path := ExtractFilePath(Application.ExeName);
      mbfile := path + '模板\';
      path2 := path + cbb1.Text + '\';
      if not DirectoryExists(path2) then
      begin
        //CreateDir(path2);
        ForceDirectories(path2);
      end;
      path2 := path2 + edt1.Text + '\条形码\';

      if not DirectoryExists(path2) then
      begin
        // CreateDir(path2);
        ForceDirectories(path2); //创建目录
      end;

      sqlstr := 'select 学校代号,科目代号,科目,考场,座位号,姓名,考号,班级 from 考场编排 where cs='+edt1.Text+'  order by 科目代号,考场,座位号';
      s := edt1.Text + '条形码打印.xls';

      mbfile := mbfile +  '条形码打印模板.xls';

      if not DirectoryExists(PChar(path2)) then
        CreateDirectory(PChar(path2), nil);

      newkc := path2 + s;

      if FileExists(newkc) then
        DeleteFile(newkc);
      CopyFile(PChar(mbfile), PChar(newkc), false);
      Sleep(500);

      if not VarIsEmpty(XLApp) then
      begin
        XLApp.DisplayAlerts := False;
        XLApp.Quit;
        VarClear(XLApp);
      end;

      try
        XLApp := CreateOleObject('Excel.Application');
      except
        Exit;
      end;

      if not FileExists(newkc) then
        exit;
      XLApp.WorkBooks.Open(newkc);
      XLApp.WorkSheets[1].Activate;

      XLApp.WorkBooks[1].WorkSheets[1].Name := mb;
      Sheet := XLApp.Workbooks[1].WorkSheets[1];

      with qry1 do
      begin
        close;
        SQL.Clear;
        sql.Add(sqlstr);
        Open;
        if recordcount > 0 then
        begin
          for i := 0 to RecordCount - 1 do
          begin

            Application.ProcessMessages;
            for j := 0 to FieldCount - 1 do
            begin
              if Fields[j].AsString='外语' then
                 value:='语数外'
              else
                  value:=  Fields[j].AsString;
              Sheet.Cells[i + 2, j + 1] := value;

            end;
            Next;
          end;
        end;

      end;
      XLApp.range['A1:A1'].select;
      XlApp.ActiveWorkbook.Save;
      XlApp.Visible := false;
    finally
      XLApp.quit;

    end;
end;

procedure TForm1.btn7Click(Sender: TObject);
begin
 ExportToExcel('好分数考生模板', 0, 0);
end;

end.

